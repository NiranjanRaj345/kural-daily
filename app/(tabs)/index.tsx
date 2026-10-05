import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, AppState, Pressable } from 'react-native';
import { Text, ActivityIndicator, Button, Snackbar, ProgressBar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KuralCard } from '../../components/KuralCard';
import { KuralDetailModal } from '../../components/KuralDetailModal';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { enableDailyReminders, formatReminderTime } from '../../services/NotificationService';
import { getDailyKural, getRandomKural } from '../../services/DailyService';
import { TOTAL_KURALS } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppTheme, space, radius } from '../../theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const greeting = (hour: number) => {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const QuickAction: React.FC<{ icon: IconName; title: string; subtitle: string; onPress: () => void }> = ({
  icon, title, subtitle, onPress,
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      android_ripple={{ color: theme.colors.primaryContainer }}
      style={({ pressed }) => [
        styles.quickAction,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.quickIcon, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name={icon} size={22} color={theme.colors.onPrimaryContainer} />
      </View>
      <Text variant="titleSmall" style={{ color: theme.colors.onSurface, marginTop: space.md }}>{title}</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{subtitle}</Text>
    </Pressable>
  );
};

export default function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const streak = useSettingsStore((s) => s.streak);
  const updateStreak = useSettingsStore((s) => s.updateStreak);
  const readCount = useSettingsStore((s) => s.history.length);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const notificationPromptDismissed = useSettingsStore((s) => s.notificationPromptDismissed);
  const dismissNotificationPrompt = useSettingsStore((s) => s.dismissNotificationPrompt);
  const notificationHour = useSettingsStore((s) => s.notificationHour);
  const notificationMinute = useSettingsStore((s) => s.notificationMinute);

  const [dailyKural, setDailyKural] = useState<Kural | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [randomKural, setRandomKural] = useState<Kural | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const loadKural = useCallback(() => {
    try {
      setDailyKural(getDailyKural());
      setNow(new Date());
      updateStreak();
    } catch (error) {
      console.error("Failed to load daily kural", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [updateStreak]);

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
    const enabled = await enableDailyReminders();
    setSnackbar(enabled
      ? `Daily reminder set for ${formatReminderTime(notificationHour, notificationMinute)}`
      : 'Notifications are blocked. You can allow them in system settings.');
  };

  const showReminderPrompt = !notificationsEnabled && !notificationPromptDismissed;
  const progress = Math.min(readCount / TOTAL_KURALS, 1);

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
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
              {greeting(now.getHours())}
            </Text>
            <Text variant="headlineMedium" accessibilityRole="header" style={{ color: theme.colors.onBackground }}>
              {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          {streak > 0 && (
            <View
              style={[styles.streak, { backgroundColor: theme.colors.accentContainer }]}
              accessible
              accessibilityLabel={`${streak} day reading streak`}
            >
              <MaterialCommunityIcons name="fire" size={18} color={theme.colors.tertiary} />
              <Text variant="labelLarge" style={{ color: theme.colors.onAccentContainer }}>{streak}</Text>
            </View>
          )}
        </View>

        {showReminderPrompt && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.reminder, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <MaterialCommunityIcons name="bell-ring-outline" size={24} color={theme.colors.onPrimaryContainer} />
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={{ color: theme.colors.onPrimaryContainer }}>
                A Kural every morning?
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.85 }}>
                Get today&apos;s Kural at {formatReminderTime(notificationHour, notificationMinute)}. Change the time anytime.
              </Text>
              <View style={styles.reminderActions}>
                <Button compact mode="contained" onPress={handleEnableReminders}>Turn on</Button>
                <Button compact textColor={theme.colors.onPrimaryContainer} onPress={dismissNotificationPrompt}>Not now</Button>
              </View>
            </View>
            <IconButton
              icon="close"
              size={18}
              iconColor={theme.colors.onPrimaryContainer}
              onPress={dismissNotificationPrompt}
              accessibilityLabel="Dismiss"
              style={styles.reminderClose}
            />
          </Animated.View>
        )}

        <SectionLabel>Today&apos;s Kural</SectionLabel>
        {dailyKural ? (
          <KuralCard kural={dailyKural} defaultExpanded />
        ) : (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>Could not load today&apos;s Kural.</Text>
        )}

        {/* Progress */}
        <SectionLabel>Your journey</SectionLabel>
        <View style={[styles.progressCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          <View style={styles.progressRow}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {readCount} <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>of {TOTAL_KURALS} read</Text>
            </Text>
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
              {progress > 0 && progress < 0.01 ? '<1' : Math.round(progress * 100)}%
            </Text>
          </View>
          <ProgressBar progress={progress} color={theme.colors.primary} style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]} />
        </View>

        {/* Discover */}
        <SectionLabel>Discover</SectionLabel>
        <View style={styles.quickRow}>
          <QuickAction
            icon="shuffle-variant"
            title="Random Kural"
            subtitle="Open any of the 1330"
            onPress={() => setRandomKural(getRandomKural())}
          />
          <QuickAction
            icon="lightbulb-on-outline"
            title="Quick quiz"
            subtitle="Test what you remember"
            onPress={() => router.navigate('/quiz')}
          />
        </View>
      </ScrollView>

      <KuralDetailModal kural={randomKural} onClose={() => setRandomKural(null)} />

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
    paddingTop: space.lg,
    gap: space.md,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  reminder: {
    flexDirection: 'row',
    gap: space.md,
    marginHorizontal: space.lg,
    marginTop: space.lg,
    padding: space.lg,
    paddingRight: space.xs,
    borderRadius: radius.lg,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  reminderClose: {
    margin: 0,
    marginTop: -8,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
  },
  progressCard: {
    marginHorizontal: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: space.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  quickRow: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  quickAction: {
    flex: 1,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
