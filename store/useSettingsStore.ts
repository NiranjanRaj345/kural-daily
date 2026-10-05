import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { computeStreak } from '../utils/date';
import type { ThemeMode } from '../theme';

interface SettingsState {
  themeMode: ThemeMode;
  showTamil: boolean;
  showEnglish: boolean;
  notificationsEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
  notificationPromptDismissed: boolean;
  favorites: number[];
  history: number[];
  shareIncludeTamil: boolean;
  shareIncludeEnglish: boolean;
  shareIncludeExplanation: boolean;
  streak: number;
  bestStreak: number;
  recentSearches: string[];
  lastReadDate: string | null;
  fontSize: number;
  selectedVoiceIdentifier: string | null;
  quizStats: {
    totalAnswered: number;
    correctAnswers: number;
    currentStreak: number;
  };
  setThemeMode: (mode: ThemeMode) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  resetProgress: () => void;
  setSelectedVoiceIdentifier: (identifier: string | null) => void;
  toggleTamil: () => void;
  toggleEnglish: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationTime: (hour: number, minute: number) => void;
  dismissNotificationPrompt: () => void;
  toggleFavorite: (kuralNumber: number) => void;
  addToHistory: (kuralNumber: number) => void;
  toggleShareIncludeTamil: () => void;
  toggleShareIncludeEnglish: () => void;
  toggleShareIncludeExplanation: () => void;
  updateStreak: () => void;
  setFontSize: (size: number) => void;
  updateQuizStats: (isCorrect: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      showTamil: true,
      showEnglish: true,
      // Off until the user opts in, so we never ask for permission on first launch
      notificationsEnabled: false,
      notificationHour: 9,
      notificationMinute: 0,
      notificationPromptDismissed: false,
      favorites: [],
      history: [],
      shareIncludeTamil: true,
      shareIncludeEnglish: true,
      shareIncludeExplanation: false,
      streak: 0,
      bestStreak: 0,
      recentSearches: [],
      lastReadDate: null,
      fontSize: 24,
      selectedVoiceIdentifier: null,
      quizStats: {
        totalAnswered: 0,
        correctAnswers: 0,
        currentStreak: 0,
      },
      setThemeMode: (mode) => set({ themeMode: mode }),
      addRecentSearch: (query) => set((state) => {
        const q = query.trim();
        if (!q) return state;
        return { recentSearches: [q, ...state.recentSearches.filter(s => s.toLowerCase() !== q.toLowerCase())].slice(0, 8) };
      }),
      clearRecentSearches: () => set({ recentSearches: [] }),
      resetProgress: () => set({
        history: [],
        streak: 0,
        bestStreak: 0,
        lastReadDate: null,
        quizStats: { totalAnswered: 0, correctAnswers: 0, currentStreak: 0 },
      }),
      setSelectedVoiceIdentifier: (identifier) => set({ selectedVoiceIdentifier: identifier }),
      toggleTamil: () => set((state) => ({ showTamil: !state.showTamil })),
      toggleEnglish: () => set((state) => ({ showEnglish: !state.showEnglish })),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setNotificationTime: (hour, minute) => set({ notificationHour: hour, notificationMinute: minute }),
      dismissNotificationPrompt: () => set({ notificationPromptDismissed: true }),
      toggleFavorite: (kuralNumber) => set((state) => {
        const isFavorite = state.favorites.includes(kuralNumber);
        return {
          favorites: isFavorite
            ? state.favorites.filter((id) => id !== kuralNumber)
            : [...state.favorites, kuralNumber],
        };
      }),
      addToHistory: (kuralNumber) => set((state) => {
        // Uncapped history: keeps all read kurals, moving the most recent to the top
        const newHistory = [kuralNumber, ...state.history.filter(id => id !== kuralNumber)];
        return { history: newHistory };
      }),
      toggleShareIncludeTamil: () => set((state) => ({ shareIncludeTamil: !state.shareIncludeTamil })),
      toggleShareIncludeEnglish: () => set((state) => ({ shareIncludeEnglish: !state.shareIncludeEnglish })),
      toggleShareIncludeExplanation: () => set((state) => ({ shareIncludeExplanation: !state.shareIncludeExplanation })),
      updateStreak: () => set((state) => {
        const next = computeStreak(state.lastReadDate, state.streak, new Date());
        if (next.lastReadDate === state.lastReadDate && next.streak === state.streak) {
          return state; // Already read today
        }
        return { ...next, bestStreak: Math.max(state.bestStreak, next.streak) };
      }),
      setFontSize: (size) => set({ fontSize: size }),
      updateQuizStats: (isCorrect) => set((state) => ({
        quizStats: {
          totalAnswered: state.quizStats.totalAnswered + 1,
          correctAnswers: state.quizStats.correctAnswers + (isCorrect ? 1 : 0),
          currentStreak: isCorrect ? state.quizStats.currentStreak + 1 : 0,
        }
      })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<SettingsState>;
        let next = { ...state };
        if (version < 1) {
          // v0 users already went through the permission prompt, so keep their
          // choice and don't show the opt-in banner again.
          next = { ...next, notificationPromptDismissed: true };
        }
        if (version < 2) {
          next = { ...next, bestStreak: Math.max(next.bestStreak ?? 0, next.streak ?? 0) };
        }
        return next as SettingsState;
      },
    }
  )
);