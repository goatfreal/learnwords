import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono';
import { Header, ActiveNavTab } from './src/components/Header';
import { WordCard } from './src/components/WordCard';
import { OptionsPanel } from './src/components/OptionsPanel';
import { SavedVaultView } from './src/components/SavedVaultView';
import { AiGeneratorView } from './src/components/AiGeneratorView';
import { COLORS } from './src/theme/colors';
import { AppSettings, WordItem, WordStats } from './src/types/words';
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  getNextUniqueWord,
  loadCurrentWord,
  loadCustomWords,
  loadSavedWords,
  loadSeenWordIds,
  loadSettings,
  loadStats,
  resetSeenWordIds,
  saveCustomWords,
  saveSettings,
  toggleSaveWord,
} from './src/storage/wordStorage';
import { updateLockScreenWordNotification } from './src/services/lockScreenService';

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('learn');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<WordStats>(DEFAULT_STATS);
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [savedWords, setSavedWords] = useState<WordItem[]>([]);
  const [customWords, setCustomWords] = useState<WordItem[]>([]);
  const [seenCount, setSeenCount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  // Initialize app data
  useEffect(() => {
    async function init() {
      const loadedSettings = await loadSettings();
      setSettings(loadedSettings);

      const loadedStats = await loadStats();
      setStats(loadedStats);

      const loadedSaved = await loadSavedWords();
      setSavedWords(loadedSaved);

      const loadedCustom = await loadCustomWords();
      setCustomWords(loadedCustom);

      const seenIds = await loadSeenWordIds();
      setSeenCount(seenIds.length);

      let word = await loadCurrentWord();
      if (!word) {
        word = await getNextUniqueWord(loadedSettings);
      }
      setCurrentWord(word);

      // Post initial notification for lock screen
      if (loadedSettings.lockScreenNotificationsEnabled && word) {
        updateLockScreenWordNotification(word, loadedSettings.displayOptions);
      }

      setIsLoading(false);
    }
    init();
  }, []);

  // Listen to AppState (when phone unlocks or app comes to foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active' && settings.frequency === 'unlock') {
        // Automatically switch word on unlock if configured
        const next = await getNextUniqueWord(settings);
        setCurrentWord(next);
        const seenIds = await loadSeenWordIds();
        setSeenCount(seenIds.length);
        if (settings.lockScreenNotificationsEnabled) {
          updateLockScreenWordNotification(next, settings.displayOptions);
        }
      }
    });
    return () => subscription.remove();
  }, [settings]);

  const handleNextWord = async () => {
    setIsLoadingNext(true);
    try {
      const next = await getNextUniqueWord(settings);
      setCurrentWord(next);
      const seenIds = await loadSeenWordIds();
      setSeenCount(seenIds.length);
      const updatedStats = await loadStats();
      setStats(updatedStats);

      if (settings.lockScreenNotificationsEnabled) {
        updateLockScreenWordNotification(next, settings.displayOptions);
      }
    } finally {
      setIsLoadingNext(false);
    }
  };

  const handleToggleSave = async () => {
    if (!currentWord) return;
    await toggleSaveWord(currentWord);
    const updated = await loadSavedWords();
    setSavedWords(updated);
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await saveSettings(newSettings);
    if (currentWord && newSettings.lockScreenNotificationsEnabled) {
      updateLockScreenWordNotification(currentWord, newSettings.displayOptions);
    }
  };

  const handleClearSeen = async () => {
    await resetSeenWordIds();
    setSeenCount(0);
  };

  const handleAddGeneratedWords = async (newWords: WordItem[]) => {
    const updated = [...customWords, ...newWords];
    setCustomWords(updated);
    await saveCustomWords(updated);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await handleNextWord();
    setIsRefreshing(false);
  };

  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="small" color={COLORS.ink} />
      </View>
    );
  }

  const isCurrentSaved = !!currentWord && savedWords.some((w) => w.id === currentWord.id);
  const allWordNames = currentWord ? [currentWord.word] : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* Top 3-Zone Bar */}
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          streakCount={stats.currentStreak}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.ink}
            />
          }
        >
          {activeTab === 'learn' && currentWord && (
            <>
              <WordCard
                word={currentWord}
                displayOptions={settings.displayOptions}
                isSaved={isCurrentSaved}
                onToggleSave={handleToggleSave}
                onNextWord={handleNextWord}
                isLoadingNext={isLoadingNext}
              />
              <OptionsPanel
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onClearSeenHistory={handleClearSeen}
                seenCount={seenCount}
              />
            </>
          )}

          {activeTab === 'vault' && (
            <SavedVaultView
              savedWords={savedWords}
              onRemoveWord={async (w) => {
                await toggleSaveWord(w);
                const updated = await loadSavedWords();
                setSavedWords(updated);
              }}
              onSelectWord={(w) => {
                setCurrentWord(w);
                setActiveTab('learn');
              }}
            />
          )}

          {activeTab === 'custom' && (
            <AiGeneratorView
              apiKey={settings.nvidiaApiKey}
              onAddGeneratedWords={handleAddGeneratedWords}
              existingWords={allWordNames}
            />
          )}

          {activeTab === 'settings' && (
            <OptionsPanel
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearSeenHistory={handleClearSeen}
              seenCount={seenCount}
            />
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
