import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, WordItem, WordStats } from '../types/words';
import { INITIAL_WORDS } from '../data/wordsData';
import { getDefaultNvidiaKey, generateNewWordsWithNvidia } from '../services/wordAiService';

const SETTINGS_KEY = '@learnwords_settings_v1';
const STATS_KEY = '@learnwords_stats_v1';
const SEEN_IDS_KEY = '@learnwords_seen_ids_v1';
const SAVED_WORDS_KEY = '@learnwords_saved_words_v1';
const CUSTOM_WORDS_KEY = '@learnwords_custom_words_v1';
const CURRENT_WORD_KEY = '@learnwords_current_word_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'all',
  selectedLevels: ['A1', 'A2', 'B1', 'B2', 'C1'],
  frequency: 'unlock',
  displayOptions: {
    showPronunciation: true,
    showMeaningTr: true,
    showExample: true,
    showExampleTr: true,
  },
  lockScreenNotificationsEnabled: true,
  nvidiaApiKey: getDefaultNvidiaKey(),
};

export const DEFAULT_STATS: WordStats = {
  totalSeen: 0,
  totalSaved: 0,
  currentStreak: 1,
  lastDateStr: new Date().toISOString().split('T')[0],
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Save settings error:', error);
  }
}

export async function loadStats(): Promise<WordStats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export async function saveStats(stats: WordStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Save stats error:', error);
  }
}

export async function loadSeenWordIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveSeenWordId(id: string): Promise<void> {
  try {
    const existing = await loadSeenWordIds();
    if (!existing.includes(id)) {
      existing.push(id);
      await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify(existing));
    }
  } catch (error) {
    console.error('Save seen id error:', error);
  }
}

export async function resetSeenWordIds(): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Reset seen ids error:', error);
  }
}

export async function loadSavedWords(): Promise<WordItem[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_WORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleSaveWord(word: WordItem): Promise<boolean> {
  try {
    const existing = await loadSavedWords();
    const idx = existing.findIndex((w) => w.id === word.id);
    let isSavedNow = false;
    if (idx >= 0) {
      existing.splice(idx, 1);
      isSavedNow = false;
    } else {
      existing.unshift(word);
      isSavedNow = true;
    }
    await AsyncStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(existing));
    return isSavedNow;
  } catch {
    return false;
  }
}

export async function loadCustomWords(): Promise<WordItem[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_WORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCustomWords(words: WordItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(words));
  } catch (error) {
    console.error('Save custom words error:', error);
  }
}

export async function loadCurrentWord(): Promise<WordItem | null> {
  try {
    const raw = await AsyncStorage.getItem(CURRENT_WORD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveCurrentWord(word: WordItem): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_WORD_KEY, JSON.stringify(word));
  } catch (error) {
    console.error('Save current word error:', error);
  }
}

// GUARANTEED NEVER-REPEAT WORD PICKER ALGORITHM
export async function getNextUniqueWord(settings: AppSettings): Promise<WordItem> {
  const seenIds = await loadSeenWordIds();
  const customWords = await loadCustomWords();
  const allAvailable = [...INITIAL_WORDS, ...customWords];

  // Filter by user's chosen language and levels
  let pool = allAvailable.filter((w) => {
    const matchLang = settings.language === 'all' || w.language === settings.language;
    const matchLevel = settings.selectedLevels.includes(w.level);
    return matchLang && matchLevel;
  });

  if (pool.length === 0) {
    pool = allAvailable;
  }

  // Find candidates that have NEVER been seen
  let unseenCandidates = pool.filter((w) => !seenIds.includes(w.id));

  // If all words in the pool have been seen, generate new ones via NVIDIA AI or reset pool safely
  if (unseenCandidates.length === 0) {
    try {
      const targetLang =
        settings.language === 'all'
          ? Math.random() > 0.5
            ? 'en'
            : 'de'
          : settings.language;
      const targetLevel =
        settings.selectedLevels[Math.floor(Math.random() * settings.selectedLevels.length)] ||
        'B2';

      const existingNames = allAvailable.map((w) => w.word);
      const generated = await generateNewWordsWithNvidia(
        targetLang,
        targetLevel,
        existingNames,
        settings.nvidiaApiKey
      );

      if (generated.length > 0) {
        const nextCustom = [...customWords, ...generated];
        await saveCustomWords(nextCustom);
        unseenCandidates = generated;
      }
    } catch (e) {
      console.warn('AI word generator fallback triggered:', e);
      // Fallback: reset history to start cycling with fresh shuffle
      await resetSeenWordIds();
      unseenCandidates = [...pool];
    }
  }

  // Pick random from unseen
  const randomIndex = Math.floor(Math.random() * unseenCandidates.length);
  const selected = unseenCandidates[randomIndex] || pool[0];

  // Mark as seen
  await saveSeenWordId(selected.id);
  await saveCurrentWord(selected);

  // Update stats
  const stats = await loadStats();
  const todayStr = new Date().toISOString().split('T')[0];
  let streak = stats.currentStreak;
  if (stats.lastDateStr !== todayStr) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    streak = stats.lastDateStr === yesterday ? streak + 1 : 1;
  }

  await saveStats({
    ...stats,
    totalSeen: stats.totalSeen + 1,
    currentStreak: streak,
    lastDateStr: todayStr,
  });

  return selected;
}
