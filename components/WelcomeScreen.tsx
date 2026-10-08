import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useSettingsStore, ReadingLanguage } from '../store/useSettingsStore';
import { getKuralByNumber } from '../services/DataService';
import { enableDailyReminders, formatReminderTime } from '../services/NotificationService';
import { TimePickerModal } from 'react-native-paper-dates';
import { uses24HourClock } from '../utils/date';
import { KuralVerse } from './KuralVerse';
import { useAppTheme, space, radius, useType } from '../theme';

const LANGUAGES: { value: ReadingLanguage; title: string; detail: string }[] = [
  { value: 'both', title: 'Tamil and English', detail: 'The original couplet with a translation' },
  { value: 'tamil', title: 'தமிழ் மட்டும்', detail: 'Couplet and Tamil explanation only' },
  { value: 'english', title: 'English only', detail: 'Translation and English explanation' },
];

/** First-launch introduction: what the Thirukkural is, how to read it, and a daily habit. */
export const WelcomeScreen: React.FC = () => {
  const theme = useAppTheme();
  const type = useType();
  const showTamil = useSettingsStore((s) => s.showTamil);
  const showEnglish = useSettingsStore((s) => s.showEnglish);
  const setReadingLanguage = useSettingsStore((s) => s.setReadingLanguage);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const dismissNotificationPrompt = useSettingsStore((s) => s.dismissNotificationPrompt);
  const notificationHour = useSettingsStore((s) => s.notificationHour);
  const notificationMinute = useSettingsStore((s) => s.notificationMinute);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [pickTime, setPickTime] = useState(false);
  const setNotificationTime = useSettingsStore((s) => s.setNotificationTime);

  const language: ReadingLanguage = showTamil && showEnglish ? 'both' : showTamil ? 'tamil' : 'english';
  const sample = getKuralByNumber(1)!;

  const finish = async (withReminder: boolean) => {
    setBusy(true);
    if (withReminder) {
      await enableDailyReminders({ withStreak: true });
    } else {
      dismissNotificationPrompt();
    }
    setBusy(false);
    completeOnboarding();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <View style={styles.progress}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.progressDot, { backgroundColor: i <= step ? theme.colors.primary : theme.colors.outlineVariant }]}
            />
          ))}
        </View>
        {step < 2 && (
          <Button compact onPress={completeOnboarding} accessibilityLabel="Skip introduction">Skip</Button>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.page}>
            <Text style={[type.kural(40), { color: theme.colors.primary }]}>திருக்குறள்</Text>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>
              One couplet a day
            </Text>
            <Text variant="bodyLarge" style={[styles.lead, { color: theme.colors.onSurfaceVariant }]}>
              Thiruvalluvar&apos;s Thirukkural has 1330 couplets in 133 chapters, on virtue, wealth and love.
              Each is two short lines that hold one complete thought.
            </Text>
            <View style={[styles.sample, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
              <Text variant="labelSmall" style={[styles.sampleLabel, { color: theme.colors.onSurfaceVariant }]}>
                The first Kural
              </Text>
              <KuralVerse kural={sample} size={20} />
              <Text style={[type.translation, styles.sampleEnglish, { color: theme.colors.onSurfaceVariant }]}>
                {sample.eng}
              </Text>
            </View>
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.page}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>How would you like to read?</Text>
            <Text variant="bodyLarge" style={[styles.lead, { color: theme.colors.onSurfaceVariant }]}>
              You can change this any time in You → Reading.
            </Text>
            <View style={styles.options}>
              {LANGUAGES.map((l) => {
                const selected = l.value === language;
                return (
                  <Pressable
                    key={l.value}
                    onPress={() => setReadingLanguage(l.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surface,
                        borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          l.value === 'tamil' ? type.tamilTitle : [type.uiStrong, styles.optionTitle],
                          { color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurface },
                        ]}
                      >
                        {l.title}
                      </Text>
                      <Text variant="bodySmall" style={{ color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }}>
                        {l.detail}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={selected ? 'radiobox-marked' : 'radiobox-blank'}
                      size={22}
                      color={selected ? theme.colors.primary : theme.colors.outline}
                    />
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInRight.duration(300)} style={styles.page}>
            <View style={[styles.bigIcon, { backgroundColor: theme.colors.primaryContainer }]}>
              <MaterialCommunityIcons name="weather-sunset-up" size={40} color={theme.colors.primary} />
            </View>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>One Kural a day</Text>
            <Text variant="bodyLarge" style={[styles.lead, { color: theme.colors.onSurfaceVariant }]}>
              A new couplet waits each morning. Read it daily to build a streak, and learn the ones you love by heart.
            </Text>
            <View style={[styles.timeCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
              <View style={{ flex: 1 }}>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Daily reminder at</Text>
                <Text style={[type.display(28), { color: theme.colors.onSurface }]}>
                  {formatReminderTime(notificationHour, notificationMinute)}
                </Text>
              </View>
              <Button mode="contained-tonal" icon="clock-edit-outline" onPress={() => setPickTime(true)}>
                Change time
              </Button>
            </View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              We&apos;ll also nudge you in the evening if you haven&apos;t read yet and your streak is about to end. Both can be changed in You → Reminders.
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant }]}>
        {step < 2 ? (
          <Button
            mode="contained"
            onPress={() => setStep(step + 1)}
            contentStyle={styles.buttonContent}
            style={styles.wide}
          >
            Continue
          </Button>
        ) : (
          <>
            <Button mode="contained" onPress={() => finish(true)} loading={busy} disabled={busy} contentStyle={styles.buttonContent} style={styles.wide}>
              Remind me daily
            </Button>
            <Button mode="text" onPress={() => finish(false)} disabled={busy} style={styles.wide}>
              Not now, start reading
            </Button>
          </>
        )}
      </View>
      <TimePickerModal
        visible={pickTime}
        onDismiss={() => setPickTime(false)}
        onConfirm={({ hours, minutes }) => { setNotificationTime(hours, minutes); setPickTime(false); }}
        hours={notificationHour}
        minutes={notificationMinute}
        label="Daily reminder time"
        use24HourClock={uses24HourClock()}
        locale="en"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    minHeight: 48,
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: space.xxl,
    paddingTop: space.xl,
    paddingBottom: space.xxl,
  },
  page: {
    gap: space.md,
  },
  lead: {
    lineHeight: 26,
  },
  sample: {
    marginTop: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sampleLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: space.md,
  },
  sampleEnglish: {
    marginTop: space.md,
    fontSize: 15,
    lineHeight: 23,
  },
  options: {
    gap: space.sm,
    marginTop: space.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  optionTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginVertical: space.sm,
  },
  bigIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  footer: {
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    gap: space.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  wide: {
    alignSelf: 'stretch',
  },
  buttonContent: {
    paddingVertical: 6,
  },
});
