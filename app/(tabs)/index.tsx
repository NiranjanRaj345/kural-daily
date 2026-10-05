import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, AppState } from 'react-native';
import { Text, useTheme, ActivityIndicator, Chip, Button, Card, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { KuralCard } from '../../components/KuralCard';
import { KuralDetailModal } from '../../components/KuralDetailModal';
import { enableDailyReminders, formatReminderTime } from '../../services/NotificationService';
import { getDailyKural, getRandomKural } from '../../services/DailyService';
import { Kural } from '../../types/kural';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function HomeScreen() {
  const theme = useTheme();
  const {
    streak, updateStreak,
    notificationsEnabled, notificationPromptDismissed, dismissNotificationPrompt,
    notificationHour, notificationMinute,
  } = useSettingsStore();
  const [dailyKural, setDailyKural] = useState<Kural | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [randomKural, setRandomKural] = useState<Kural | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const loadKural = useCallback(() => {
    try {
      const kural = getDailyKural();
      setDailyKural(kural);
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

  const handleRandomKural = () => {
    setRandomKural(getRandomKural());
  };

  const handleEnableReminders = async () => {
    const enabled = await enableDailyReminders();
    setSnackbar(enabled
      ? `Daily reminder set for ${formatReminderTime(notificationHour, notificationMinute)}`
      : 'Notifications are blocked. You can allow them in system settings.');
  };

  const showReminderPrompt = !notificationsEnabled && !notificationPromptDismissed;

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.secondary }}>
          Loading today&apos;s wisdom...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={theme.dark ? ['#1a1a1a', '#2d2d2d'] : ['#ffffff', '#f0f4f8']}
          style={styles.header}
        >
          <View style={styles.topRow}>
            <View style={{ flex: 1 }} />
            {streak > 0 && (
              <Chip
                icon={() => <MaterialCommunityIcons name="fire" size={20} color="#FF5722" />}
                style={styles.streakChip}
                textStyle={{ fontWeight: 'bold', color: theme.colors.onSurface }}
              >
                {streak} Day Streak
              </Chip>
            )}
          </View>
          <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>Thirukkural Daily</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.secondary, opacity: 0.8 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </LinearGradient>

        {showReminderPrompt && (
          <Card style={styles.reminderCard} mode="contained">
            <Card.Title
              title="Get a daily reminder?"
              subtitle={`We'll send today's Kural at ${formatReminderTime(notificationHour, notificationMinute)}`}
              subtitleNumberOfLines={2}
              left={() => <MaterialCommunityIcons name="bell-ring-outline" size={28} color={theme.colors.primary} />}
            />
            <Card.Actions>
              <Button onPress={dismissNotificationPrompt}>Not now</Button>
              <Button mode="contained" onPress={handleEnableReminders}>Enable</Button>
            </Card.Actions>
          </Card>
        )}

        {dailyKural ? (
          <KuralCard kural={dailyKural} />
        ) : (
          <Text style={styles.errorText}>Could not load today&apos;s Kural.</Text>
        )}

        <View style={styles.footer}>
          <Button
            mode="contained-tonal"
            icon="shuffle-variant"
            onPress={handleRandomKural}
            style={styles.randomButton}
          >
            Read Random Kural
          </Button>
        </View>
      </ScrollView>

      <KuralDetailModal kural={randomKural} onClose={() => setRandomKural(null)} title="Random Kural" />

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
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  streakChip: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  randomButton: {
    width: '100%',
  },
  reminderCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
});
