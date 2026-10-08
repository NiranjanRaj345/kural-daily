import React, { useState } from 'react';
import { View, StyleSheet, Platform, Alert, Linking } from 'react-native';
import { List, Switch, Text, Divider, SegmentedButtons } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { SheetModal } from '../SheetModal';
import { AppearancePicker } from './AppearancePicker';
import { FontPicker } from './FontPicker';
import { useSettingsStore, ReadingLanguage } from '../../store/useSettingsStore';
import { getKuralByNumber } from '../../services/DataService';
import {
  enableDailyReminders, disableDailyReminders, setStreakReminder, formatReminderTime,
  sendTestReminder, TEST_REMINDER_DELAY_SECONDS,
} from '../../services/NotificationService';
import { uses24HourClock } from '../../utils/date';
import { DEVICE_TEXT_SIZE, useReadingSizes } from '../../hooks/useReadingSizes';
import { ACCENTS, APPEARANCES, READING_FONTS, useAppTheme, useType, space, radius } from '../../theme';

export const FONT_SIZES = [
  { value: '20', label: 'S', accessibilityLabel: 'Small' },
  { value: '24', label: 'M', accessibilityLabel: 'Medium' },
  { value: '28', label: 'L', accessibilityLabel: 'Large' },
  { value: '32', label: 'XL', accessibilityLabel: 'Extra large' },
];

export const SPEECH_RATES = [
  { value: '0.7', label: 'Slow' },
  { value: '0.9', label: 'Steady' },
  { value: '1', label: 'Natural' },
];

const LANGUAGES: { value: ReadingLanguage; label: string }[] = [
  { value: 'both', label: 'Both' },
  { value: 'tamil', label: 'தமிழ்' },
  { value: 'english', label: 'English' },
];

/** One-line summaries for the settings rows on the You tab. */
export const useSettingsSummary = () => {
  const s = useSettingsStore();
  const language: ReadingLanguage = s.showTamil && s.showEnglish ? 'both' : s.showTamil ? 'tamil' : 'english';
  const page = APPEARANCES.find((a) => a.value === s.appearance)?.label;
  const accent = ACCENTS.find((a) => a.value === s.accent)?.label;
  const font = READING_FONTS.find((f) => f.value === s.readingFont)?.label;
  const size = s.fontSize === DEVICE_TEXT_SIZE
    ? "Phone's"
    : FONT_SIZES.find((f) => f.value === String(s.fontSize))?.accessibilityLabel ?? `${s.fontSize}`;
  const speed = SPEECH_RATES.find((r) => r.value === String(s.speechRate))?.label;
  const reminders = [
    s.notificationsEnabled && `Daily ${formatReminderTime(s.notificationHour, s.notificationMinute)}`,
    s.streakReminderEnabled && `Streak ${formatReminderTime(s.streakReminderHour, s.streakReminderMinute)}`,
  ].filter(Boolean);
  return {
    language,
    appearance: `${page} page · ${accent} · ${font} font`,
    reading: `${LANGUAGES.find((l) => l.value === language)?.label} · ${size} text · ${speed} speech`,
    reminders: reminders.length > 0 ? reminders.join(' · ') : 'Off',
  };
};

interface SheetProps {
  visible: boolean;
  onClose: () => void;
}

const Block: React.FC<{ title: string; detail?: string; children: React.ReactNode }> = ({ title, detail, children }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.block}>
      <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>{title}</Text>
      {detail && <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{detail}</Text>}
      {children}
    </View>
  );
};

/**
 * One line of the first Kural at the chosen reading size, shown only under the
 * text-size control, where the effect isn't otherwise visible.
 */
const SizeSample: React.FC = () => {
  const theme = useAppTheme();
  const type = useType();
  const sizes = useReadingSizes();
  const kural = getKuralByNumber(1)!;
  return (
    <Text style={[type.kural(sizes.verse), styles.sizeSample, { color: theme.colors.ink }]} numberOfLines={1}>
      {kural.line1}
    </Text>
  );
};

/** Page colour, accent, font and couplet weight. Each choice previews itself. */
export const AppearanceSheet: React.FC<SheetProps> = ({ visible, onClose }) => {
  const theme = useAppTheme();
  const boldKural = useSettingsStore((s) => s.boldKural);
  const setBoldKural = useSettingsStore((s) => s.setBoldKural);
  return (
    <SheetModal visible={visible} onClose={onClose} title="Appearance" height="85%">
      <AppearancePicker />
      <FontPicker />
      <Block title="Couplet weight" detail="Off sets the Kural in a lighter book weight">
        <View style={styles.switchRow}>
          <Text variant="bodyMedium" style={[styles.flex, { color: theme.colors.onSurface }]}>
            Bold couplet
          </Text>
          <Switch value={boldKural} onValueChange={setBoldKural} accessibilityLabel="Bold couplet" />
        </View>
      </Block>
    </SheetModal>
  );
};

/** Language, text size and speech speed. */
export const ReadingSheet: React.FC<SheetProps> = ({ visible, onClose }) => {
  const theme = useAppTheme();
  const { language } = useSettingsSummary();
  const fontSize = useSettingsStore((s) => s.fontSize);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const setReadingLanguage = useSettingsStore((s) => s.setReadingLanguage);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const setSpeechRate = useSettingsStore((s) => s.setSpeechRate);

  return (
    <SheetModal visible={visible} onClose={onClose} title="Reading" height="75%">
      <Block title="Language" detail="The couplet, its translation and the meaning">
        <SegmentedButtons
          value={language}
          onValueChange={(v) => setReadingLanguage(v as ReadingLanguage)}
          density="small"
          style={styles.segment}
          buttons={LANGUAGES}
        />
      </Block>
      <Block title="Text size" detail="The couplet, its translation and the meaning">
        <View style={styles.switchRow}>
          <Text variant="bodyMedium" style={[styles.flex, { color: theme.colors.onSurface }]}>
            Match my phone&apos;s text size
          </Text>
          <Switch
            value={fontSize === DEVICE_TEXT_SIZE}
            onValueChange={(on) => setFontSize(on ? DEVICE_TEXT_SIZE : 24)}
            accessibilityLabel="Match my phone's text size"
          />
        </View>
        {fontSize !== DEVICE_TEXT_SIZE && (
          <SegmentedButtons
            value={fontSize.toString()}
            onValueChange={(val) => setFontSize(parseInt(val, 10))}
            density="small"
            style={styles.segment}
            buttons={FONT_SIZES}
          />
        )}
        <SizeSample />
      </Block>
      <Block title="Reading speed" detail="For Listen and when learning by heart">
        <SegmentedButtons
          value={String(speechRate)}
          onValueChange={(v) => setSpeechRate(Number(v))}
          density="small"
          style={styles.segment}
          buttons={SPEECH_RATES}
        />
      </Block>
    </SheetModal>
  );
};

const showBlocked = () =>
  Alert.alert(
    'Notifications are off',
    'Kural Daily is not allowed to send notifications. You can allow them in your phone settings.',
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open settings', onPress: () => Linking.openSettings() },
    ]
  );

/** Daily Kural and streak reminders, their times, and a test notification. */
export const RemindersSheet: React.FC<SheetProps> = ({ visible, onClose }) => {
  const theme = useAppTheme();
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const notificationHour = useSettingsStore((s) => s.notificationHour);
  const notificationMinute = useSettingsStore((s) => s.notificationMinute);
  const setNotificationTime = useSettingsStore((s) => s.setNotificationTime);
  const streakReminderEnabled = useSettingsStore((s) => s.streakReminderEnabled);
  const streakReminderHour = useSettingsStore((s) => s.streakReminderHour);
  const streakReminderMinute = useSettingsStore((s) => s.streakReminderMinute);
  const setStreakReminderTime = useSettingsStore((s) => s.setStreakReminderTime);

  const [timePicker, setTimePicker] = useState<'daily' | 'streak' | null>(null);
  const [testSent, setTestSent] = useState(false);

  const onToggleDaily = async () => {
    if (notificationsEnabled) {
      await disableDailyReminders();
      return;
    }
    if (!(await enableDailyReminders()) && Platform.OS !== 'web') showBlocked();
  };

  const onToggleStreak = async () => {
    const turningOn = !streakReminderEnabled;
    if (!(await setStreakReminder(turningOn)) && turningOn && Platform.OS !== 'web') showBlocked();
  };

  const onTest = async () => {
    if (await sendTestReminder()) setTestSent(true);
    else showBlocked();
  };

  // Rescheduling follows automatically (the root layout re-plans on these changes)
  const onConfirmTime = ({ hours, minutes }: { hours: number; minutes: number }) => {
    if (timePicker === 'daily') setNotificationTime(hours, minutes);
    if (timePicker === 'streak') setStreakReminderTime(hours, minutes);
    setTimePicker(null);
  };

  const divider = <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />;

  return (
    <SheetModal visible={visible} onClose={() => { setTestSent(false); onClose(); }} title="Reminders" height="65%">
      <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <List.Item
          title="Daily Kural"
          description={notificationsEnabled ? `Each day's Kural at ${formatReminderTime(notificationHour, notificationMinute)}` : 'Off'}
          left={(props) => <List.Icon {...props} icon="bell-outline" />}
          right={() => <Switch value={notificationsEnabled} onValueChange={onToggleDaily} />}
          onPress={onToggleDaily}
        />
        {notificationsEnabled && (
          <>
            {divider}
            <List.Item
              title="Time"
              description={formatReminderTime(notificationHour, notificationMinute)}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
              right={(props) => <List.Icon {...props} icon="pencil-outline" />}
              onPress={() => setTimePicker('daily')}
            />
          </>
        )}
      </View>

      <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <List.Item
          title="Streak reminder"
          description={streakReminderEnabled
            ? `If you haven't read by ${formatReminderTime(streakReminderHour, streakReminderMinute)}, a nudge to keep your streak`
            : 'Off'}
          descriptionNumberOfLines={2}
          left={(props) => <List.Icon {...props} icon="fire" />}
          right={() => <Switch value={streakReminderEnabled} onValueChange={onToggleStreak} />}
          onPress={onToggleStreak}
        />
        {streakReminderEnabled && (
          <>
            {divider}
            <List.Item
              title="Time"
              description={formatReminderTime(streakReminderHour, streakReminderMinute)}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
              right={(props) => <List.Icon {...props} icon="pencil-outline" />}
              onPress={() => setTimePicker('streak')}
            />
          </>
        )}
      </View>

      {Platform.OS !== 'web' && (
        <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          <List.Item
            title="Send a test reminder"
            description={testSent
              ? `On its way: lock your phone and wait ${TEST_REMINDER_DELAY_SECONDS} seconds.`
              : `Arrives in ${TEST_REMINDER_DELAY_SECONDS} seconds, even with the app closed`}
            descriptionNumberOfLines={2}
            descriptionStyle={testSent ? { color: theme.colors.primary } : undefined}
            left={(props) => <List.Icon {...props} icon={testSent ? 'check-circle-outline' : 'bell-ring-outline'} />}
            onPress={onTest}
          />
        </View>
      )}

      <Text variant="bodySmall" style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
        Reminders are scheduled on your phone; nothing is sent over the internet. A day counts as read once you
        have spent a few seconds on a Kural, or listened to it, opened its meaning, saved, shared or learned it.
      </Text>

      <TimePickerModal
        visible={timePicker !== null}
        onDismiss={() => setTimePicker(null)}
        onConfirm={onConfirmTime}
        hours={timePicker === 'streak' ? streakReminderHour : notificationHour}
        minutes={timePicker === 'streak' ? streakReminderMinute : notificationMinute}
        label={timePicker === 'streak' ? 'Streak reminder time' : 'Daily reminder time'}
        use24HourClock={uses24HourClock()}
        locale="en"
      />
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  block: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    gap: 2,
  },
  segment: {
    marginTop: space.sm,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.xs,
  },
  flex: {
    flex: 1,
  },
  sizeSample: {
    marginTop: space.md,
  },
  group: {
    marginHorizontal: space.lg,
    marginTop: space.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  note: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    lineHeight: 18,
  },
});
