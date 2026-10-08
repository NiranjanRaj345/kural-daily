import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, AppState, Pressable } from 'react-native';
import { Text, ActivityIndicator, Button, Snackbar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KuralCard } from '../../components/KuralCard';
import { KuralDetailModal } from '../../components/KuralDetailModal';
import { StreakPill } from '../../components/ui/StreakPill';
import { enableDailyReminders, formatReminderTime } from '../../services/NotificationService';
import { getDailyKural, getRandomKural } from '../../services/DailyService';
import { getChapterNumber, getKuralsByChapter } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { useSettingsStore } from '../../store/useSettingsStore';
import { learningSummary } from '../../utils/srs';
import { toLocalDateKey } from '../../utils/date';
import { useAppTheme, space, radius, useType } from '../../theme';

export default function TodayScreen() {
  const theme = useAppTheme();
  const type = useType();
  const router = useRouter();
  const streak = useSettingsStore((s) => s.streak);
  const readDays = useSettingsStore((s) => s.readDays);
  const history = useSettingsStore((s) => s.history);
  const learning = useSettingsStore((s) => s.learning);
  const expireStreak = useSettingsStore((s) => s.expireStreak);
  // The welcome screens cover Today until they are finished
  const onboarded = useSettingsStore((s) => s.onboarded);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const notificationPromptDismissed = useSettingsStore((s) => s.notificationPromptDismissed);
  const dismissNotificationPrompt = useSettingsStore((s) => s.dismissNotificationPrompt);
  const notificationHour = useSettingsStore((s) => s.notificationHour);
  const notificationMinute = useSettingsStore((s) => s.notificationMinute);

  const [dailyKural, setDailyKural] = useState<Kural | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detail, setDetail] = useState<{ kural: Kural; sequence?: Kural[] } | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const loadKural = useCallback(() => {
    try {
      setDailyKural(getDailyKural());
      setNow(new Date());
      // Opening the app doesn't count as reading; it only ends a streak that has lapsed
      expireStreak();
    } catch (error) {
      console.error("Failed to load daily kural", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [expireStreak]);

  useEffect(() => {
    loadKural();
    // Pick up the new day's Kural if the app was left open past midnight
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadKural();
    });
    return () => sub.remove();
  }, [loadKural]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadKural();
  }, [loadKural]);

  const handleEnableReminders = async () => {
    const enabled = await enableDailyReminders({ withStreak: true });
    setSnackbar(enabled
      ? `Daily reminder set for ${formatReminderTime(notificationHour, notificationMinute)}`
      : 'Notifications are blocked. You can allow them in system settings.');
  };

  const readSet = useMemo(() => new Set(history), [history]);
  const chapterKurals = useMemo(
    () => (dailyKural ? getKuralsByChapter(getChapterNumber(dailyKural)) : []),
    [dailyKural]
  );
  const chapterRead = chapterKurals.filter((k) => readSet.has(k.number)).length;
  const firstUnread = chapterKurals.find((k) => !readSet.has(k.number)) ?? chapterKurals[0];
  const dueCount = learningSummary(learning, toLocalDateKey(now)).due;
  const showReminderPrompt = !notificationsEnabled && !notificationPromptDismissed;

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} colors={[theme.colors.primary]} />
        }
      >
        {/* Greeting */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[type.tamilLabelStrong, { color: theme.colors.primary }]}>வணக்கம் · இன்றைய குறள்</Text>
            <Text variant="headlineMedium" accessibilityRole="header" style={{ color: theme.colors.onBackground }}>
              {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <IconButton
            icon="magnify"
            mode="contained-tonal"
            onPress={() => router.navigate('/search')}
            accessibilityLabel="Search Kurals"
          />
        </View>

        <StreakPill readDays={readDays} streak={streak} onPress={() => router.navigate('/profile')} />

        {dueCount > 0 && (
          <Pressable
            onPress={() => router.navigate('/learn')}
            accessibilityRole="button"
            style={[styles.banner, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <MaterialCommunityIcons name="calendar-check-outline" size={22} color={theme.colors.onPrimaryContainer} />
            <Text variant="titleSmall" style={[styles.bannerText, { color: theme.colors.onPrimaryContainer }]}>
              {dueCount} {dueCount === 1 ? 'Kural' : 'Kurals'} to review today
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.onPrimaryContainer} />
          </Pressable>
        )}

        {showReminderPrompt && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.reminder, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <MaterialCommunityIcons name="bell-ring-outline" size={22} color={theme.colors.onPrimaryContainer} />
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={{ color: theme.colors.onPrimaryContainer }}>
                A Kural every morning?
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.85 }}>
                Each day&apos;s Kural at {formatReminderTime(notificationHour, notificationMinute)}, and a nudge before your streak ends. Change times in You.
              </Text>
              <View style={styles.reminderActions}>
                <Button compact mode="contained" onPress={handleEnableReminders}>Turn on</Button>
                <Button compact textColor={theme.colors.onPrimaryContainer} onPress={dismissNotificationPrompt}>Not now</Button>
              </View>
            </View>
          </Animated.View>
        )}

        {dailyKural ? (
          <View style={styles.cardSpacing}>
            <KuralCard kural={dailyKural} defaultExpanded visible={onboarded && !detail} />
          </View>
        ) : (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Today&apos;s Kural didn&apos;t load. Pull down to try again. If it keeps happening, close the app fully
            and open it again.
          </Text>
        )}

        {/* Keep reading: the rest of today's chapter */}
        {dailyKural && firstUnread && (
          <Pressable
            onPress={() => setDetail({ kural: firstUnread, sequence: chapterKurals })}
            accessibilityRole="button"
            accessibilityLabel={`Read the chapter ${dailyKural.chap_tam}, ${chapterRead} of 10 read`}
            android_ripple={{ color: theme.colors.primaryContainer }}
            style={[styles.chapterRow, { borderColor: theme.colors.rule }]}
          >
            <View style={{ flex: 1 }}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {chapterRead >= 10 ? 'Chapter complete · read again' : 'Keep reading this chapter'}
              </Text>
              <Text style={[type.tamilTitle, { color: theme.colors.onSurface }]}>{dailyKural.chap_tam}</Text>
              <View style={styles.chapterProgress}>
                {chapterKurals.map((k) => (
                  <View
                    key={k.number}
                    style={[
                      styles.chapterDot,
                      {
                        backgroundColor: readSet.has(k.number) ? theme.colors.primary : theme.colors.outlineVariant,
                        borderColor: k.number === dailyKural.number ? theme.colors.primary : 'transparent',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>{chapterRead}/10</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.colors.primary} />
          </Pressable>
        )}

        <Pressable
          onPress={() => setDetail({ kural: getRandomKural() })}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.randomLink}
        >
          <MaterialCommunityIcons name="shuffle-variant" size={18} color={theme.colors.primary} />
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>Open a random Kural</Text>
        </Pressable>
      </ScrollView>

      <KuralDetailModal kural={detail?.kural ?? null} sequence={detail?.sequence} onClose={() => setDetail(null)} />

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar(null)} duration={4000}>
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: space.xxxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.md,
    gap: space.md,
  },
  cardSpacing: {
    marginTop: space.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.lg,
    marginTop: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.lg,
  },
  bannerText: {
    flex: 1,
  },
  reminder: {
    flexDirection: 'row',
    gap: space.md,
    marginHorizontal: space.lg,
    marginTop: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
  },
  // A plain row under the card, not another card
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.xl,
    marginTop: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chapterProgress: {
    flexDirection: 'row',
    gap: 4,
    marginTop: space.sm,
  },
  chapterDot: {
    width: 14,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
  randomLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.sm,
    marginHorizontal: space.xl,
    marginTop: space.lg,
    minHeight: 44,
  },
});
