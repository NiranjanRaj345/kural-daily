import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { computeStreak, toLocalDateKey } from '../utils/date';
import { LearningMap, newCard, reviewCard } from '../utils/srs';
import type { Accent, Appearance, ReadingFont } from '../theme';

export type ReadingLanguage = 'both' | 'tamil' | 'english';

interface QuizStats {
  totalAnswered: number;
  correctAnswers: number;
  currentStreak: number;
}

export interface SettingsState {
  // Appearance
  appearance: Appearance;
  accent: Accent;
  readingFont: ReadingFont;
  fontSize: number;
  showTamil: boolean;
  showEnglish: boolean;

  // Reminders & audio
  notificationsEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
  notificationPromptDismissed: boolean;
  selectedVoiceIdentifier: string | null;
  /** Text-to-speech rate; slower helps when learning to recite. */
  speechRate: number;

  // Sharing
  shareIncludeTamil: boolean;
  shareIncludeEnglish: boolean;
  shareIncludeExplanation: boolean;

  // Progress
  onboarded: boolean;
  favorites: number[];
  history: number[];
  /** Local date keys of days the user opened the app to read, oldest first. */
  readDays: string[];
  streak: number;
  bestStreak: number;
  lastReadDate: string | null;
  learning: LearningMap;
  recentSearches: string[];
  quizStats: QuizStats;

  // Actions
  setAppearance: (appearance: Appearance) => void;
  setAccent: (accent: Accent) => void;
  setReadingFont: (font: ReadingFont) => void;
  setFontSize: (size: number) => void;
  setReadingLanguage: (language: ReadingLanguage) => void;
  toggleTamil: () => void;
  toggleEnglish: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationTime: (hour: number, minute: number) => void;
  dismissNotificationPrompt: () => void;
  setSelectedVoiceIdentifier: (identifier: string | null) => void;
  setSpeechRate: (rate: number) => void;
  toggleShareIncludeTamil: () => void;
  toggleShareIncludeEnglish: () => void;
  toggleShareIncludeExplanation: () => void;
  completeOnboarding: () => void;
  toggleFavorite: (kuralNumber: number) => void;
  addToHistory: (kuralNumber: number) => void;
  updateStreak: () => void;
  startLearning: (kuralNumber: number) => void;
  stopLearning: (kuralNumber: number) => void;
  reviewKural: (kuralNumber: number, remembered: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  updateQuizStats: (isCorrect: boolean) => void;
  resetProgress: () => void;
}

const MAX_READ_DAYS = 400;

const emptyQuizStats: QuizStats = { totalAnswered: 0, correctAnswers: 0, currentStreak: 0 };

type PersistedState = Partial<SettingsState> & { themeMode?: string };

/** Upgrades settings saved by older app versions. Exported for tests. */
export const migrateSettings = (persisted: unknown, version: number): SettingsState => {
  let next = { ...((persisted ?? {}) as PersistedState) };
  if (version < 1) {
    // v0 users already went through the permission prompt, so keep their
    // choice and don't show the opt-in banner again.
    next = { ...next, notificationPromptDismissed: true };
  }
  if (version < 2) {
    next = { ...next, bestStreak: Math.max(next.bestStreak ?? 0, next.streak ?? 0) };
  }
  if (version < 3) {
    // themeMode (system/light/dark/sepia) became appearance (auto/paper/night/palm)
    const map: Record<string, Appearance> = { system: 'auto', light: 'paper', dark: 'night', sepia: 'palm' };
    const { themeMode, ...rest } = next;
    next = {
      ...rest,
      appearance: map[themeMode ?? 'system'] ?? 'auto',
      // Existing users have already been using the app; skip the welcome screens
      onboarded: true,
      readDays: next.lastReadDate ? [next.lastReadDate] : [],
    };
  }
  return next as SettingsState;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      appearance: 'auto',
      accent: 'indigo',
      readingFont: 'classic',
      fontSize: 24,
      showTamil: true,
      showEnglish: true,

      // Off until the user opts in, so we never ask for permission on first launch
      notificationsEnabled: false,
      notificationHour: 9,
      notificationMinute: 0,
      notificationPromptDismissed: false,
      selectedVoiceIdentifier: null,
      speechRate: 0.9,

      shareIncludeTamil: true,
      shareIncludeEnglish: true,
      shareIncludeExplanation: false,

      onboarded: false,
      favorites: [],
      history: [],
      readDays: [],
      streak: 0,
      bestStreak: 0,
      lastReadDate: null,
      learning: {},
      recentSearches: [],
      quizStats: emptyQuizStats,

      setAppearance: (appearance) => set({ appearance }),
      setAccent: (accent) => set({ accent }),
      setReadingFont: (readingFont) => set({ readingFont }),
      setFontSize: (size) => set({ fontSize: size }),
      setReadingLanguage: (language) => set({
        showTamil: language !== 'english',
        showEnglish: language !== 'tamil',
      }),
      toggleTamil: () => set((state) => ({ showTamil: !state.showTamil })),
      toggleEnglish: () => set((state) => ({ showEnglish: !state.showEnglish })),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setNotificationTime: (hour, minute) => set({ notificationHour: hour, notificationMinute: minute }),
      dismissNotificationPrompt: () => set({ notificationPromptDismissed: true }),
      setSelectedVoiceIdentifier: (identifier) => set({ selectedVoiceIdentifier: identifier }),
      setSpeechRate: (rate) => set({ speechRate: rate }),
      toggleShareIncludeTamil: () => set((state) => ({ shareIncludeTamil: !state.shareIncludeTamil })),
      toggleShareIncludeEnglish: () => set((state) => ({ shareIncludeEnglish: !state.shareIncludeEnglish })),
      toggleShareIncludeExplanation: () => set((state) => ({ shareIncludeExplanation: !state.shareIncludeExplanation })),
      completeOnboarding: () => set({ onboarded: true }),

      toggleFavorite: (kuralNumber) => set((state) => ({
        favorites: state.favorites.includes(kuralNumber)
          ? state.favorites.filter((id) => id !== kuralNumber)
          : [...state.favorites, kuralNumber],
      })),
      addToHistory: (kuralNumber) => set((state) => {
        if (state.history[0] === kuralNumber) return state;
        // Each Kural once, most recent first (so at most 1330 entries)
        return { history: [kuralNumber, ...state.history.filter((id) => id !== kuralNumber)] };
      }),
      updateStreak: () => set((state) => {
        const today = new Date();
        const todayKey = toLocalDateKey(today);
        const next = computeStreak(state.lastReadDate, state.streak, today);
        const readDays = state.readDays.includes(todayKey)
          ? state.readDays
          : [...state.readDays, todayKey].slice(-MAX_READ_DAYS);
        if (next.lastReadDate === state.lastReadDate && next.streak === state.streak && readDays === state.readDays) {
          return state; // Already counted today
        }
        return { ...next, readDays, bestStreak: Math.max(state.bestStreak, next.streak) };
      }),

      startLearning: (kuralNumber) => set((state) => {
        if (state.learning[kuralNumber]) return state;
        return { learning: { ...state.learning, [kuralNumber]: newCard(toLocalDateKey(new Date())) } };
      }),
      stopLearning: (kuralNumber) => set((state) => {
        const { [kuralNumber]: _removed, ...rest } = state.learning;
        return { learning: rest };
      }),
      reviewKural: (kuralNumber, remembered) => set((state) => {
        const todayKey = toLocalDateKey(new Date());
        const card = state.learning[kuralNumber] ?? newCard(todayKey);
        return { learning: { ...state.learning, [kuralNumber]: reviewCard(card, remembered, todayKey) } };
      }),

      addRecentSearch: (query) => set((state) => {
        const q = query.trim();
        if (!q) return state;
        return { recentSearches: [q, ...state.recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, 8) };
      }),
      clearRecentSearches: () => set({ recentSearches: [] }),
      updateQuizStats: (isCorrect) => set((state) => ({
        quizStats: {
          totalAnswered: state.quizStats.totalAnswered + 1,
          correctAnswers: state.quizStats.correctAnswers + (isCorrect ? 1 : 0),
          currentStreak: isCorrect ? state.quizStats.currentStreak + 1 : 0,
        },
      })),
      resetProgress: () => set({
        history: [],
        readDays: [],
        streak: 0,
        bestStreak: 0,
        lastReadDate: null,
        learning: {},
        quizStats: emptyQuizStats,
      }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: migrateSettings,
    }
  )
);
