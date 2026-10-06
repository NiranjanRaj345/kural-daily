import * as Notifications from 'expo-notifications';
import { scheduleReminders, syncDailyReminders, enableDailyReminders, setStreakReminder } from '../services/NotificationService';
import { getKuralForDate } from '../services/DailyService';
import { useSettingsStore } from '../store/useSettingsStore';
import { toLocalDateKey } from '../utils/date';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const mocked = Notifications as jest.Mocked<typeof Notifications>;
const scheduled = () => mocked.scheduleNotificationAsync.mock.calls.map((c) => c[0]);

beforeEach(() => {
  jest.clearAllMocks();
  useSettingsStore.setState({
    notificationsEnabled: false,
    streakReminderEnabled: false,
    notificationHour: 9,
    notificationMinute: 0,
    streakReminderHour: 20,
    streakReminderMinute: 0,
    streak: 0,
    lastReadDate: null,
  });
});

describe('scheduleReminders', () => {
  it("names each day's Kural in its daily reminder", async () => {
    const date = new Date(2030, 0, 15, 9, 0);
    await scheduleReminders([{ kind: 'daily', date, dayKey: '2030-01-15' }]);
    const [request] = scheduled();
    const kural = getKuralForDate(date);
    expect(request.content.title).toContain(String(kural.number));
    expect(request.content.body).toContain(kural.line1);
    expect(request.trigger).toMatchObject({ type: 'date', date, channelId: 'daily-kural' });
  });

  it('words the streak reminder around the streak, on its own channel', async () => {
    const date = new Date(2030, 0, 15, 20, 0);
    await scheduleReminders([{ kind: 'streak', date, dayKey: '2030-01-15', streak: 6 }]);
    const [request] = scheduled();
    expect(request.content.title).toBe('Keep your 6-day streak');
    expect(request.trigger).toMatchObject({ channelId: 'streak' });
  });

  it('replaces whatever was scheduled before', async () => {
    await scheduleReminders([]);
    expect(mocked.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });
});

describe('syncDailyReminders', () => {
  afterEach(() => jest.useRealTimers());

  it('never prompts in the background, and keeps settings while permission is undecided', async () => {
    useSettingsStore.setState({ notificationsEnabled: true, streakReminderEnabled: true });
    mocked.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as never);

    expect(await syncDailyReminders()).toBe(false);
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
    // A sync that may prompt can still ask later
    expect(useSettingsStore.getState()).toMatchObject({ notificationsEnabled: true, streakReminderEnabled: true });
  });

  it('switches reminders off when permission was refused in system settings', async () => {
    useSettingsStore.setState({ notificationsEnabled: true, streakReminderEnabled: true });
    mocked.getPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);

    expect(await syncDailyReminders()).toBe(false);
    expect(useSettingsStore.getState()).toMatchObject({ notificationsEnabled: false, streakReminderEnabled: false });
  });

  it('cancels everything when both reminders are off', async () => {
    await syncDailyReminders();
    expect(mocked.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('schedules the daily window and exactly one streak nudge', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }).setSystemTime(new Date(2026, 9, 6, 12, 0));
    mocked.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
    useSettingsStore.setState({
      notificationsEnabled: true,
      streakReminderEnabled: true,
      notificationHour: 7,
      notificationMinute: 30,
      streakReminderHour: 20,
      streakReminderMinute: 0,
      streak: 3,
      lastReadDate: '2026-10-05',
    });
    await syncDailyReminders();
    const channels = scheduled().map((r) => (r.trigger as { channelId: string }).channelId);
    expect(channels.filter((c) => c === 'daily-kural')).toHaveLength(30);
    expect(channels.filter((c) => c === 'streak')).toHaveLength(1);
    const streak = scheduled().find((r) => (r.trigger as { channelId: string }).channelId === 'streak')!;
    expect((streak.trigger as { date: Date }).date).toEqual(new Date(2026, 9, 6, 20, 0));
  });

  it("doesn't reschedule when nothing changed", async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }).setSystemTime(new Date(2026, 9, 6, 12, 0));
    mocked.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
    useSettingsStore.setState({ notificationsEnabled: true, notificationHour: 8, notificationMinute: 15 });
    await syncDailyReminders();
    const first = mocked.scheduleNotificationAsync.mock.calls.length;
    await syncDailyReminders();
    expect(mocked.scheduleNotificationAsync.mock.calls.length).toBe(first);

    useSettingsStore.setState({ notificationMinute: 16 });
    await syncDailyReminders();
    expect(mocked.scheduleNotificationAsync.mock.calls.length).toBeGreaterThan(first);
  });
});

describe('turning reminders on', () => {
  it('asks for permission and switches the setting off if refused', async () => {
    mocked.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as never);
    mocked.requestPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);

    expect(await enableDailyReminders({ withStreak: true })).toBe(false);
    expect(mocked.requestPermissionsAsync).toHaveBeenCalled();
    expect(useSettingsStore.getState()).toMatchObject({ notificationsEnabled: false, streakReminderEnabled: false });
  });

  it('turns on both with the welcome choice when allowed', async () => {
    mocked.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as never);
    mocked.requestPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);

    expect(await enableDailyReminders({ withStreak: true })).toBe(true);
    expect(useSettingsStore.getState()).toMatchObject({ notificationsEnabled: true, streakReminderEnabled: true });
  });

  it('can turn on the streak reminder by itself', async () => {
    mocked.getPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
    expect(await setStreakReminder(true)).toBe(true);
    expect(useSettingsStore.getState()).toMatchObject({ notificationsEnabled: false, streakReminderEnabled: true });
  });
});
