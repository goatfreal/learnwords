export type Language = 'en' | 'de' | 'all';

export type WordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type UpdateFrequency = 'unlock' | '15m' | '30m' | '1h' | 'daily';

export interface WordItem {
  id: string;
  word: string;
  language: 'en' | 'de';
  level: WordLevel;
  partOfSpeech: string;
  pronunciation: string;
  meaningTr: string;
  exampleSentence: string;
  exampleSentenceTr: string;
  synonyms?: string[];
}

export interface CardDisplayOptions {
  showPronunciation: boolean; // okunuşu
  showMeaningTr: boolean;     // türkçe anlamı
  showExample: boolean;       // örnek cümle
  showExampleTr: boolean;     // örnek cümle türkçesi
}

export interface AppSettings {
  language: Language;
  selectedLevels: WordLevel[];
  frequency: UpdateFrequency;
  displayOptions: CardDisplayOptions;
  lockScreenNotificationsEnabled: boolean;
  nvidiaApiKey: string;
}

export interface WordStats {
  totalSeen: number;
  totalSaved: number;
  currentStreak: number;
  lastDateStr: string;
}
