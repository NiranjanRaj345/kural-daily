import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, FlatList, BackHandler, Linking, Platform, Share } from 'react-native';
import {
  List, Switch, Text, Divider, SegmentedButtons, IconButton, Portal, Dialog, RadioButton, Button, Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { useSettingsStore, ReadingLanguage } from '../../store/useSettingsStore';
import {
  enableDailyReminders, disableDailyReminders, syncDailyReminders, formatReminderTime,
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
import { computeMilestones } from '../../utils/milestones';
import { MASTERED_BOX } from '../../utils/srs';
import { APP_NAME, APP_VERSION, SHARE_APP_MESSAGE } from '../../constants/app';
import { useAppTheme, space, radius } from '../../theme';

const REMINDER_TIMES: [number, number][] = [
  [6, 0], [7, 0], [8, 0], [9, 0], [12, 0], [18, 0], [20, 0], [21, 0],
];

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
    fontSize, setFontSize, speechRate, setSpeechRate,
    streak, bestStreak, history, learning,
    selectedVoiceIdentifier, setSelectedVoiceIdentifier,
    resetProgress,
  } = useSettingsStore();

  const language: ReadingLanguage = showTamil && showEnglish ? 'both' : showTamil ? 'tamil' : 'english';
  const milestones = useMemo(() => computeMilestones({ history, bestStreak, learning }), [history, bestStreak, learning]);
  const earnedCount = milestones.filter((m) => m.earned).length;
  const mastered = useMemo(() => Object.values(learning).filter((c) => c.box >= MASTERED_BOX).length, [learning]);
  const previewKural = getKuralByNumber(1)!;

  const [showHistory, setShowHistory] = useState(false);
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);
  const [allVoices, setAllVoices] = useState<Speech.Voice[]>([]);
  const [showAllVoices, setShowAllVoices] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; openSettings?: boolean } | null>(null);

  const historyKurals = useMemo(
    () => history.map((id) => getKuralByNumber(id)).filter((k): k is Kural => k !== undefined),
    [history]
  );

  const loadVoices = async () => {
    try {
      setAllVoices(await Speech.getAvailableVoicesAsync());
    } catch (error) {
      console.error("Failed to load voices", error);
    }
  };

  const displayedVoices = useMemo(() => {
    if (showAllVoices) return allVoices;
    const tamil = allVoices.filter(v =>
      (v.language && v.language.toLowerCase().startsWith('ta')) ||
      (v.name && v.name.toLowerCase().includes('tamil'))
    );
    // If no Tamil voices found, show all by default so the list isn't empty
    return tamil.length > 0 ? tamil : allVoices;
  }, [allVoices, showAllVoices]);

  const selectedVoiceName = allVoices.find((v) => v.identifier === selectedVoiceIdentifier)?.name;

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    if (showVoiceModal) loadVoices();
  }, [showVoiceModal]);

  const handleVoicePreview = (voiceIdentifier: string) => {
    Speech.stop();
    Speech.speak('வணக்கம், இது திருக்குறள்', { language: 'ta-IN', voice: voiceIdentifier });
  };

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

  const onSelectReminderTime = async (value: string) => {
    const [hour, minute] = value.split(':').map(Number);
    setNotificationTime(hour, minute);
    setShowTimeDialog(false);
    await syncDailyReminders();
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

        <SectionLabel>Reminders & audio</SectionLabel>
        <Group>
          <List.Item
            title="Daily reminder"
            description={notificationsEnabled ? `Each day's Kural at ${formatReminderTime(notificationHour, notificationMinute)}` : 'Off'}
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={() => <Switch value={notificationsEnabled} onValueChange={onToggleNotifications} />}
            onPress={onToggleNotifications}
          />
          {notificationsEnabled && (
            <List.Item
              title="Reminder time"
              description={formatReminderTime(notificationHour, notificationMinute)}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setShowTimeDialog(true)}
            />
          )}
          <List.Item
            title="Reading voice"
            description={selectedVoiceIdentifier ? selectedVoiceName ?? 'Custom voice' : 'System default'}
            left={(props) => <List.Icon {...props} icon="account-voice" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowVoiceModal(true)}
          />
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
            • Notifications (optional): Used only for the daily reminder, scheduled locally on your device. Requested only when you turn reminders on.{'\n'}
            • Sharing: Kural images are created on your device and passed to the share sheet you choose. No storage permission is needed.
          </Text>

          <Text variant="bodySmall" style={{ marginTop: space.xl, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Last updated: October 5, 2026
          </Text>
        </View>
      </SheetModal>

      {/* Voice Selection */}
      <SheetModal
        visible={showVoiceModal}
        onClose={() => { Speech.stop(); setShowVoiceModal(false); }}
        title="Reading voice"
        scrollable={false}
        headerRight={<IconButton icon="refresh" onPress={loadVoices} accessibilityLabel="Refresh voices" />}
      >
        <List.Item
          title="Show all languages"
          description={`${allVoices.length} voices on this device`}
          right={() => <Switch value={showAllVoices} onValueChange={setShowAllVoices} />}
          style={{ backgroundColor: theme.colors.surfaceVariant }}
        />
        <FlatList
          data={displayedVoices}
          keyExtractor={(item) => item.identifier}
          contentContainerStyle={{ paddingBottom: space.xl }}
          ListHeaderComponent={
            <List.Item
              title="System default"
              description="Use the device's Tamil voice"
              onPress={() => setSelectedVoiceIdentifier(null)}
              left={(props) => (
                <List.Icon {...props} icon={!selectedVoiceIdentifier ? 'radiobox-marked' : 'radiobox-blank'} color={theme.colors.primary} />
              )}
            />
          }
          ItemSeparatorComponent={() => <Divider style={{ marginLeft: 56 }} />}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.language}
              onPress={() => setSelectedVoiceIdentifier(item.identifier)}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={selectedVoiceIdentifier === item.identifier ? 'radiobox-marked' : 'radiobox-blank'}
                  color={theme.colors.primary}
                />
              )}
              right={() => (
                <IconButton
                  icon="play-circle-outline"
                  onPress={() => handleVoicePreview(item.identifier)}
                  accessibilityLabel={`Preview ${item.name}`}
                />
              )}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="account-voice-off"
              title="No voices found"
              message="Install a Tamil text-to-speech voice in your device settings, then tap refresh."
            />
          }
        />
      </SheetModal>

      <Portal>
        {/* Reminder Time */}
        <Dialog visible={showTimeDialog} onDismiss={() => setShowTimeDialog(false)}>
          <Dialog.Title>Reminder time</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 360 }}>
            <ScrollView>
              <RadioButton.Group onValueChange={onSelectReminderTime} value={`${notificationHour}:${notificationMinute}`}>
                {REMINDER_TIMES.map(([hour, minute]) => (
                  <RadioButton.Item
                    key={`${hour}:${minute}`}
                    label={formatReminderTime(hour, minute)}
                    value={`${hour}:${minute}`}
                  />
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowTimeDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>

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
