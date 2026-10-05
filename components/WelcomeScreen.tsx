import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useSettingsStore, ReadingLanguage } from '../store/useSettingsStore';
import { getKuralByNumber } from '../services/DataService';
import { enableDailyReminders, formatReminderTime } from '../services/NotificationService';
import { KuralVerse } from './KuralVerse';
import { useAppTheme, space, radius, useType } from '../theme';

const LANGUAGES: { value: ReadingLanguage; title: string; detail: string }[] = [
  { value: 'both', title: 'Tamil and English', detail: 'The original couplet with a translation' },
  { value: 'tamil', title: 'தமிழ் மட்டும்', detail: 'Couplet and Tamil explanation only' },
  { value: 'english', title: 'English only', detail: 'Translation and English explanation' },
];

const FACTS = [
  { value: '1330', label: 'couplets' },
  { value: '133', label: 'chapters' },
  { value: '3', label: 'books' },
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

  const language: ReadingLanguage = showTamil && showEnglish ? 'both' : showTamil ? 'tamil' : 'english';
  const sample = getKuralByNumber(1)!;

  const finish = async (withReminder: boolean) => {
    setBusy(true);
    if (withReminder) {
      await enableDailyReminders();
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
              Two lines of wisdom, every day
            </Text>
            <Text variant="bodyLarge" style={[styles.lead, { color: theme.colors.onSurfaceVariant }]}>
              Written by Thiruvalluvar some two thousand years ago, the Thirukkural speaks of virtue, wealth
              and love, each thought in a single couplet of seven words.
            </Text>
            <View style={styles.facts}>
              {FACTS.map((f) => (
                <View key={f.label} style={[styles.fact, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
                  <Text style={[type.display(26), { color: theme.colors.primary }]}>{f.value}</Text>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{f.label}</Text>
                </View>
              ))}
            </View>
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
            <View style={[styles.bigIcon, { backgroundColor: theme.colors.flameContainer }]}>
              <MaterialCommunityIcons name="weather-sunset-up" size={40} color={theme.colors.flame} />
            </View>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>One Kural a day</Text>
            <Text variant="bodyLarge" style={[styles.lead, { color: theme.colors.onSurfaceVariant }]}>
              A new couplet waits each morning. Read it daily to build a streak, and learn the ones you love by heart.
              {'\n\n'}
              Would you like a gentle reminder at {formatReminderTime(notificationHour, notificationMinute)}? You can change the time later.
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
  facts: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.sm,
  },
  fact: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
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
