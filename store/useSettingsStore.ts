import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  themeMode: 'light' | 'dark' | 'sepia';
  showTamil: boolean;
  showEnglish: boolean;
  notificationsEnabled: boolean;
  favorites: number[];
  history: number[];
  shareIncludeTamil: boolean;
  shareIncludeEnglish: boolean;
  shareIncludeExplanation: boolean;
  streak: number;
  lastReadDate: string | null;
  fontSize: number;
  selectedVoiceIdentifier: string | null;
  quizStats: {
    totalAnswered: number;
    correctAnswers: number;
    currentStreak: number;
  };
  setThemeMode: (mode: 'light' | 'dark' | 'sepia') => void;
  setSelectedVoiceIdentifier: (identifier: string | null) => void;
  toggleTamil: () => void;
  toggleEnglish: () => void;
  toggleNotifications: () => void;
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
      themeMode: 'light',
      showTamil: true,
      showEnglish: true,
      notificationsEnabled: true,
      favorites: [],
      history: [],
      shareIncludeTamil: true,
      shareIncludeEnglish: true,
      shareIncludeExplanation: false,
      streak: 0,
      lastReadDate: null,
      fontSize: 24,
      selectedVoiceIdentifier: null,
      quizStats: {
        totalAnswered: 0,
        correctAnswers: 0,
        currentStreak: 0,
      },
      setThemeMode: (mode) => set({ themeMode: mode }),
      setSelectedVoiceIdentifier: (identifier) => set({ selectedVoiceIdentifier: identifier }),
      toggleTamil: () => set((state) => ({ showTamil: !state.showTamil })),
      toggleEnglish: () => set((state) => ({ showEnglish: !state.showEnglish })),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
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
        const today = new Date().toISOString().split('T')[0];
        
        if (state.lastReadDate === today) {
          return state; // Already read today
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (state.lastReadDate === yesterdayStr) {
          // Streak continues
          return { streak: state.streak + 1, lastReadDate: today };
        } else {
          // Streak broken or first time
          return { streak: 1, lastReadDate: today };
        }
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
    }
  )
);