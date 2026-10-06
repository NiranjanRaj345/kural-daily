import { migrateSettings, normalizeTime, useSettingsStore } from '../store/useSettingsStore';

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

describe('streak reminder migration', () => {
  it('turns the streak reminder on for people who already had reminders', () => {
    expect(migrateSettings({ notificationsEnabled: true }, 3).streakReminderEnabled).toBe(true);
    expect(migrateSettings({ notificationsEnabled: false }, 3).streakReminderEnabled).toBe(false);
  });
});

describe('reminder times', () => {
  it('keeps any valid time as chosen', () => {
    expect(normalizeTime(6, 47)).toEqual({ hour: 6, minute: 47 });
    expect(normalizeTime(23, 59)).toEqual({ hour: 23, minute: 59 });
    expect(normalizeTime(0, 0)).toEqual({ hour: 0, minute: 0 });
  });

  it('turns out-of-range picker values into a real time', () => {
    expect(normalizeTime(24, 4)).toEqual({ hour: 0, minute: 4 });
    expect(normalizeTime(9, 75)).toEqual({ hour: 9, minute: 59 });
    expect(normalizeTime(NaN, NaN)).toEqual({ hour: 9, minute: 0 });
  });

  it('is applied when saving either reminder time', () => {
    useSettingsStore.getState().setNotificationTime(24, 30);
    useSettingsStore.getState().setStreakReminderTime(21, 15);
    expect(useSettingsStore.getState()).toMatchObject({
      notificationHour: 0, notificationMinute: 30, streakReminderHour: 21, streakReminderMinute: 15,
    });
  });
});
