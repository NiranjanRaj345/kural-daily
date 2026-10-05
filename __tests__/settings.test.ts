import { migrateSettings } from '../store/useSettingsStore';

describe('settings migration', () => {
  it('maps the old theme modes to appearances', () => {
    expect(migrateSettings({ themeMode: 'system' }, 2).appearance).toBe('auto');
    expect(migrateSettings({ themeMode: 'light' }, 2).appearance).toBe('paper');
    expect(migrateSettings({ themeMode: 'dark' }, 2).appearance).toBe('night');
    expect(migrateSettings({ themeMode: 'sepia' }, 2).appearance).toBe('palm');
    expect('themeMode' in migrateSettings({ themeMode: 'dark' }, 2)).toBe(false);
  });

  it('skips the welcome screens for existing users and keeps their progress', () => {
    const state = migrateSettings({ streak: 4, lastReadDate: '2026-10-04', favorites: [1, 2] }, 2);
    expect(state.onboarded).toBe(true);
    expect(state.readDays).toEqual(['2026-10-04']);
    expect(state.favorites).toEqual([1, 2]);
    expect(state.streak).toBe(4);
  });

  it('upgrades the oldest settings through every step', () => {
    const state = migrateSettings({ streak: 3, themeMode: 'light' }, 0);
    expect(state.notificationPromptDismissed).toBe(true);
    expect(state.bestStreak).toBe(3);
    expect(state.appearance).toBe('paper');
  });
});
