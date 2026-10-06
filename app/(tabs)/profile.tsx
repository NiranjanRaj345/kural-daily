import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, FlatList, BackHandler, Linking, Platform, Share } from 'react-native';
import {
  List, Switch, Text, Divider, SegmentedButtons, IconButton, Portal, Dialog, Button, Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useSettingsStore, ReadingLanguage } from '../../store/useSettingsStore';
import { TimePickerModal } from 'react-native-paper-dates';
import { uses24HourClock } from '../../utils/date';
import {
  enableDailyReminders, disableDailyReminders, setStreakReminder, formatReminderTime,
} from '../../services/NotificationService';
import { getKuralByNumber, TOTAL_KURALS } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { KuralDetailModal } from '../../components/KuralDetailModal';
import { SheetModal } from '../../components/SheetModal';
import { KuralListItem } from '../../components/ui/KuralListItem';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { StatTile } from '../../components/ui/StatTile';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { EmptyState } from '../../components/ui/EmptyState';
import { KuralVerse } from '../../components/KuralVerse';
import { AboutKuralSheet } from '../../components/AboutKuralSheet';
import { AppearancePicker } from '../../components/profile/AppearancePicker';
import { MilestoneGrid } from '../../components/profile/MilestoneGrid';
import { FontPicker } from '../../components/profile/FontPicker';
import { VoicePickerSheet } from '../../components/profile/VoicePickerSheet';
import { getTamilVoices } from '../../services/SpeechService';
import { openVoiceDownload } from '../../components/voiceHelp';
import { computeMilestones } from '../../utils/milestones';
import { MASTERED_BOX } from '../../utils/srs';
import { APP_NAME, APP_VERSION, SHARE_APP_MESSAGE } from '../../constants/app';
import { useAppTheme, space, radius } from '../../theme';

const FONT_SIZES = [
  { value: '20', label: 'S', accessibilityLabel: 'Small' },
  { value: '24', label: 'M', accessibilityLabel: 'Medium' },
  { value: '28', label: 'L', accessibilityLabel: 'Large' },
  { value: '32', label: 'XL', accessibilityLabel: 'Extra large' },
];

const SPEECH_RATES = [
  { value: '0.7', label: 'Slow' },
  { value: '0.9', label: 'Steady' },
  { value: '1', label: 'Natural' },
];

/** A rounded group of settings rows. */
const Group: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useAppTheme();
  return (
    <View style={[styles.group, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
      {children}
    </View>
  );
};

export default function ProfileScreen() {
  const theme = useAppTheme();
  const {
    showEnglish, showTamil, setReadingLanguage,
    notificationsEnabled, notificationHour, notificationMinute, setNotificationTime,
    streakReminderEnabled, streakReminderHour, streakReminderMinute, setStreakReminderTime,
    fontSize, setFontSize, speechRate, setSpeechRate,
    streak, bestStreak, history, learning,
    selectedVoiceIdentifier,
    resetProgress,
  } = useSettingsStore();

  const language: ReadingLanguage = showTamil && showEnglish ? 'both' : showTamil ? 'tamil' : 'english';
  const milestones = useMemo(() => computeMilestones({ history, bestStreak, learning }), [history, bestStreak, learning]);
  const earnedCount = milestones.filter((m) => m.earned).length;
  const mastered = useMemo(() => Object.values(learning).filter((c) => c.box >= MASTERED_BOX).length, [learning]);
  const previewKural = getKuralByNumber(1)!;

  const [showHistory, setShowHistory] = useState(false);
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [timePicker, setTimePicker] = useState<'daily' | 'streak' | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; openSettings?: boolean } | null>(null);

  const historyKurals = useMemo(
    () => history.map((id) => getKuralByNumber(id)).filter((k): k is Kural => k !== undefined),
    [history]
  );

  // Name shown on the Reading voice row
  const [voiceName, setVoiceName] = useState<string | null>(null);
  useEffect(() => {
    if (showVoiceModal) return;
    getTamilVoices().then((voices) => {
      const chosen = selectedVoiceIdentifier ? voices.find((v) => v.identifier === selectedVoiceIdentifier) : voices[0];
      setVoiceName(chosen?.name ?? null);
    });
  }, [selectedVoiceIdentifier, showVoiceModal]);

  const onToggleNotifications = async () => {
    if (notificationsEnabled) {
      await disableDailyReminders();
      return;
    }
    const enabled = await enableDailyReminders();
    if (!enabled) {
      setSnackbar({ message: 'Notifications are blocked for this app.', openSettings: Platform.OS !== 'web' });
    }
  };

  const onToggleStreakReminder = async () => {
    const enabled = await setStreakReminder(!streakReminderEnabled);
    if (!streakReminderEnabled && !enabled) {
      setSnackbar({ message: 'Notifications are blocked for this app.', openSettings: Platform.OS !== 'web' });
    }
  };

  // Rescheduling follows automatically (the root layout re-plans on these changes)
  const onConfirmTime = ({ hours, minutes }: { hours: number; minutes: number }) => {
    if (timePicker === 'daily') setNotificationTime(hours, minutes);
    if (timePicker === 'streak') setStreakReminderTime(hours, minutes);
    setTimePicker(null);
  };

  const onReset = () => {
    resetProgress();
    setShowResetDialog(false);
    setSnackbar({ message: 'Your reading progress, learning and quiz scores were reset.' });
  };

  // Android back closes the history view instead of leaving the tab
  useFocusEffect(
    useCallback(() => {
      if (!showHistory) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        setShowHistory(false);
        return true;
      });
      return () => sub.remove();
    }, [showHistory])
  );

  const openKural = useCallback((kural: Kural) => setSelectedKural(kural), []);

  if (showHistory) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.subHeader}>
          <IconButton icon="arrow-left" onPress={() => setShowHistory(false)} accessibilityLabel="Back" />
          <Text variant="titleLarge" accessibilityRole="header" style={{ color: theme.colors.onBackground, flex: 1 }}>
            Reading history
          </Text>
        </View>
        <FlatList
          data={historyKurals}
          keyExtractor={(item) => item.number.toString()}
          renderItem={({ item }) => <KuralListItem kural={item} onPress={openKural} showChapter showEnglish={false} />}
          contentContainerStyle={styles.listContent}
          initialNumToRender={12}
          ListEmptyComponent={
            <EmptyState icon="history" title="No history yet" message="Kurals you open will appear here, most recent first." />
          }
        />
        <KuralDetailModal kural={selectedKural} onClose={() => setSelectedKural(null)} sequence={historyKurals} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.listContent}>
        <ScreenHeader title="You" />

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatTile icon="fire" iconColor={theme.colors.flame} value={streak} label="Day streak" />
            <StatTile icon="trophy-outline" iconColor={theme.colors.flame} value={bestStreak} label="Best streak" />
          </View>
          <View style={styles.statsRow}>
            <StatTile icon="book-open-variant" value={`${history.length}/${TOTAL_KURALS}`} label="Kurals read" />
            <StatTile icon="head-heart-outline" iconColor={theme.colors.success} value={mastered} label="By heart" />
          </View>
        </View>

        <SectionLabel>Milestones · {earnedCount}/{milestones.length}</SectionLabel>
        <MilestoneGrid milestones={milestones} />

        <SectionLabel>Library</SectionLabel>
        <Group>
          <List.Item
            title="Reading history"
            description={history.length > 0 ? `${history.length} Kurals, most recent first` : 'Nothing read yet'}
            left={(props) => <List.Icon {...props} icon="history" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowHistory(true)}
          />
          <List.Item
            title="About the Thirukkural"
            description="The poet, the couplet form, and how the book is arranged"
            left={(props) => <List.Icon {...props} icon="book-information-variant" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowAbout(true)}
          />
        </Group>

        <SectionLabel>Look</SectionLabel>
        <Group>
          <AppearancePicker />
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <FontPicker />
        </Group>

        <SectionLabel>Reading</SectionLabel>
        <Group>
          <View style={styles.block}>
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>Language</Text>
            <SegmentedButtons
              value={language}
              onValueChange={(v) => setReadingLanguage(v as ReadingLanguage)}
              density="small"
              style={styles.segment}
              buttons={[
                { value: 'both', label: 'Both' },
                { value: 'tamil', label: 'தமிழ்' },
                { value: 'english', label: 'English' },
              ]}
            />
          </View>
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <View style={styles.block}>
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>Kural text size</Text>
            <SegmentedButtons
              value={fontSize.toString()}
              onValueChange={(val) => setFontSize(parseInt(val, 10))}
              density="small"
              style={styles.segment}
              buttons={FONT_SIZES}
            />
            <View style={[styles.preview, { backgroundColor: theme.colors.background }]}>
              <KuralVerse kural={previewKural} size={fontSize} />
            </View>
          </View>
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <View style={styles.block}>
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>Reading speed</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>For Listen and when learning by heart</Text>
            <SegmentedButtons
              value={String(speechRate)}
              onValueChange={(v) => setSpeechRate(Number(v))}
              density="small"
              style={styles.segment}
              buttons={SPEECH_RATES}
            />
          </View>
        </Group>

        <SectionLabel>Reminders</SectionLabel>
        <Group>
          <List.Item
            title="Daily Kural"
            description={notificationsEnabled ? `Each day's Kural at ${formatReminderTime(notificationHour, notificationMinute)}` : 'Off'}
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={() => <Switch value={notificationsEnabled} onValueChange={onToggleNotifications} />}
            onPress={onToggleNotifications}
          />
          {notificationsEnabled && (
            <List.Item
              title="Daily reminder time"
              description={formatReminderTime(notificationHour, notificationMinute)}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
              right={(props) => <List.Icon {...props} icon="pencil-outline" />}
              onPress={() => setTimePicker('daily')}
            />
          )}
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <List.Item
            title="Streak reminder"
            description={streakReminderEnabled
              ? `If you haven't read by ${formatReminderTime(streakReminderHour, streakReminderMinute)}, a nudge to keep your streak`
              : 'Off'}
            descriptionNumberOfLines={2}
            left={(props) => <List.Icon {...props} icon="fire" />}
            right={() => <Switch value={streakReminderEnabled} onValueChange={onToggleStreakReminder} />}
            onPress={onToggleStreakReminder}
          />
          {streakReminderEnabled && (
            <List.Item
              title="Streak reminder time"
              description={formatReminderTime(streakReminderHour, streakReminderMinute)}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
              right={(props) => <List.Icon {...props} icon="pencil-outline" />}
              onPress={() => setTimePicker('streak')}
            />
          )}
        </Group>

        <SectionLabel>Listening</SectionLabel>
        <Group>
          <List.Item
            title="Reading voice"
            description={selectedVoiceIdentifier ? voiceName ?? 'Custom voice' : voiceName ? `Automatic · ${voiceName}` : 'Automatic'}
            left={(props) => <List.Icon {...props} icon="account-voice" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowVoiceModal(true)}
          />
          {Platform.OS !== 'web' && (
            <List.Item
              title="Install Tamil voices"
              description={Platform.OS === 'android' ? "Download a more natural voice for your phone's text-to-speech" : 'How to download a more natural voice'}
              descriptionNumberOfLines={2}
              left={(props) => <List.Icon {...props} icon="download-outline" />}
              right={(props) => <List.Icon {...props} icon="open-in-new" />}
              onPress={openVoiceDownload}
            />
          )}
        </Group>

        <SectionLabel>Share</SectionLabel>
        <Group>
          <List.Item
            title="Share Kural Daily"
            description="Invite a friend or family member to read along"
            left={(props) => <List.Icon {...props} icon="account-heart-outline" />}
            right={(props) => <List.Icon {...props} icon="share-variant-outline" />}
            onPress={() => Share.share({ message: SHARE_APP_MESSAGE }).catch(() => {})}
          />
        </Group>

        <SectionLabel>About</SectionLabel>
        <Group>
          <List.Item
            title="Privacy policy"
            description="No accounts, no tracking, works offline"
            left={(props) => <List.Icon {...props} icon="shield-check-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPrivacyModal(true)}
          />
          <List.Item
            title="Reset progress"
            description="Clears history, streaks, learning and quiz scores. Saved Kurals are kept."
            descriptionNumberOfLines={2}
            titleStyle={{ color: theme.colors.error }}
            left={(props) => <List.Icon {...props} color={theme.colors.error} icon="restore" />}
            onPress={() => setShowResetDialog(true)}
          />
        </Group>

        <Text variant="labelSmall" style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
          {APP_NAME} {APP_VERSION}
        </Text>
      </ScrollView>

      <AboutKuralSheet visible={showAbout} onClose={() => setShowAbout(false)} />

      {/* Privacy Policy */}
      <SheetModal visible={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Privacy policy">
        <View style={styles.policy}>
          <Text variant="titleMedium" style={styles.policyHeading}>Data collection</Text>
          <Text variant="bodyMedium" style={[styles.policyBody, { color: theme.colors.onSurfaceVariant }]}>
            We do not collect, store, or share any personal information. There are no accounts, ads, analytics or tracking. The app works fully offline.
          </Text>

          <Text variant="titleMedium" style={styles.policyHeading}>Local storage</Text>
          <Text variant="bodyMedium" style={[styles.policyBody, { color: theme.colors.onSurfaceVariant }]}>
            All user preferences (theme, history, favorites, streaks, quiz scores) are stored locally on your device. This data never leaves your phone and is removed when you uninstall the app.
          </Text>

          <Text variant="titleMedium" style={styles.policyHeading}>Permissions</Text>
          <Text variant="bodyMedium" style={[styles.policyBody, { color: theme.colors.onSurfaceVariant }]}>
            • Notifications (optional): Used only for the daily Kural and streak reminders you turn on, scheduled locally on your device. Requested only when you turn a reminder on.{'\n'}
            • Read aloud: Uses your phone&apos;s own text-to-speech voices. Nothing is sent anywhere by the app.{'\n'}
            • Sharing: Kural images are created on your device and passed to the share sheet you choose. No storage permission is needed.
          </Text>

          <Text variant="bodySmall" style={{ marginTop: space.xl, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Last updated: October 6, 2026
          </Text>
        </View>
      </SheetModal>

      <VoicePickerSheet visible={showVoiceModal} onClose={() => setShowVoiceModal(false)} />

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

      <Portal>

        {/* Reset confirmation */}
        <Dialog visible={showResetDialog} onDismiss={() => setShowResetDialog(false)}>
          <Dialog.Icon icon="restore" />
          <Dialog.Title style={{ textAlign: 'center' }}>Reset progress?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This clears your reading history, streaks and quiz scores. Your saved Kurals and settings stay. This can&apos;t be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowResetDialog(false)}>Cancel</Button>
            <Button textColor={theme.colors.error} onPress={onReset}>Reset</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar(null)}
        duration={5000}
        action={snackbar?.openSettings ? { label: 'Settings', onPress: () => Linking.openSettings() } : undefined}
      >
        {snackbar?.message}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: space.sm,
    paddingBottom: space.xxxl,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
  statsGrid: {
    gap: space.sm,
    paddingHorizontal: space.lg,
    marginBottom: space.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  group: {
    marginHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  block: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  segment: {
    marginTop: space.sm,
  },
  preview: {
    marginTop: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
  },
  version: {
    textAlign: 'center',
    marginTop: space.xxl,
  },
  policy: {
    paddingHorizontal: space.xl,
  },
  policyHeading: {
    marginBottom: space.sm,
  },
  policyBody: {
    marginBottom: space.xl,
    lineHeight: 22,
  },
});
