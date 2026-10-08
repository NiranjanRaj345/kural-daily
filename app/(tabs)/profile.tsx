import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, FlatList, BackHandler, Share, Linking } from 'react-native';
import { List, Text, Divider, IconButton, Portal, Dialog, Button, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSettingsStore } from '../../store/useSettingsStore';
import { toLocalDateKey } from '../../utils/date';
import { getKuralByNumber } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { KuralDetailModal } from '../../components/KuralDetailModal';
import { SheetModal } from '../../components/SheetModal';
import { KuralListItem } from '../../components/ui/KuralListItem';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Stats } from '../../components/ui/Stats';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { EmptyState } from '../../components/ui/EmptyState';
import { AboutKuralSheet } from '../../components/AboutKuralSheet';
import { MilestoneGrid } from '../../components/profile/MilestoneGrid';
import { ReadingCalendar } from '../../components/profile/ReadingCalendar';
import { AppearanceSheet, ReadingSheet, RemindersSheet, useSettingsSummary } from '../../components/profile/SettingsSheets';
import { VoicePickerSheet } from '../../components/profile/VoicePickerSheet';
import { getTamilVoices } from '../../services/SpeechService';
import { completedChapters, computeMilestones } from '../../utils/milestones';
import { MASTERED_BOX } from '../../utils/srs';
import { APP_NAME, APP_VERSION, CONTACT_EMAIL, PUBLISHER, REPO_URL, SHARE_APP_MESSAGE } from '../../constants/app';
import { useAppTheme, space, radius } from '../../theme';

const PRIVACY_UPDATED = '8 October 2026';

/** The in-app privacy policy, in the same words as PRIVACY.md. */
const PRIVACY_SECTIONS = [
  {
    heading: 'Data collection',
    body: 'We do not collect, store or share any personal information. There are no accounts, ads, analytics, tracking or crash reporting, and the app makes no network requests of its own. It works fully offline.',
  },
  {
    heading: 'Data stored on your device',
    body: 'Your settings (appearance, font, text size, reading language, voice and speed, reminders, share options), saved Kurals, reading history, reading days and streaks, the Kurals you are learning and their review dates, quiz scores and recent searches.\n\nThis data never leaves your phone. It is deleted when you uninstall the app or clear its data. Reset progress (below) clears your reading history, reading days, streaks, learning and quiz scores; your saved Kurals and settings stay.',
  },
  {
    heading: 'Permissions',
    body: "• Notifications (optional): only for the daily Kural and streak reminders you turn on, scheduled on your device. Asked for only when you turn a reminder on.\n• Read aloud: uses your phone's own text-to-speech voices. The app sends nothing anywhere; your phone's speech engine may have its own policy if it uses an online voice.\n• Sharing: Kural images are made on your device and handed to the share sheet you choose. No storage permission is needed. On iPhone, Save Image asks to add it to your Photos.",
  },
  {
    heading: 'Children',
    body: 'The app is suitable for all ages and collects no data from anyone, including children.',
  },
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
  const streak = useSettingsStore((s) => s.streak);
  const bestStreak = useSettingsStore((s) => s.bestStreak);
  const history = useSettingsStore((s) => s.history);
  const readDays = useSettingsStore((s) => s.readDays);
  const learning = useSettingsStore((s) => s.learning);
  const selectedVoiceIdentifier = useSettingsStore((s) => s.selectedVoiceIdentifier);
  const resetProgress = useSettingsStore((s) => s.resetProgress);
  const summary = useSettingsSummary();

  const milestones = useMemo(() => computeMilestones({ history, bestStreak, learning }), [history, bestStreak, learning]);
  const earnedCount = milestones.filter((m) => m.earned).length;
  // The unearned milestone closest to being earned
  const nextMilestone = useMemo(
    () => milestones.filter((m) => !m.earned).sort((a, b) => b.progress - a.progress)[0],
    [milestones]
  );
  const mastered = useMemo(() => Object.values(learning).filter((c) => c.box >= MASTERED_BOX).length, [learning]);
  const chaptersDone = useMemo(() => completedChapters(history), [history]);
  const readToday = readDays.includes(toLocalDateKey(new Date()));

  const [showHistory, setShowHistory] = useState(false);
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [sheet, setSheet] = useState<'milestones' | 'appearance' | 'reading' | 'reminders' | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

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

  const onReset = () => {
    resetProgress();
    setShowResetDialog(false);
    setSnackbar('Your reading progress, learning and quiz scores were reset.');
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
            <EmptyState icon="history" title="No history yet" message="Kurals you read appear here, most recent first. A Kural counts after a few seconds with it." />
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

        {/* Reading progress: streak and calendar */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          <View style={styles.streakRow}>
            <View style={[styles.flameBadge, { backgroundColor: streak > 0 ? theme.colors.flameContainer : theme.colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="fire" size={26} color={streak > 0 ? theme.colors.flame : theme.colors.outline} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
                {streak > 0 ? `${streak}-day streak` : 'No streak yet'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {streak > 0 && !readToday ? "Read today's Kural to keep it going" : streak > 0 ? 'Read today · see you tomorrow' : 'Read a Kural today to start one'}
              </Text>
            </View>
            <View style={styles.best}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{bestStreak}</Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Best</Text>
            </View>
          </View>
          <Divider style={[styles.cardDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <ReadingCalendar readDays={readDays} />
          <Divider style={[styles.cardDivider, { backgroundColor: theme.colors.outlineVariant }]} />
          <Stats
            items={[
              { value: history.length, label: 'Kurals read' },
              { value: chaptersDone, label: 'Chapters done' },
              { value: mastered, label: 'By heart' },
            ]}
          />
        </View>

        <SectionLabel>Progress</SectionLabel>
        <Group>
          <List.Item
            title={`Milestones · ${earnedCount} of ${milestones.length}`}
            description={nextMilestone ? `Next: ${nextMilestone.description} (${nextMilestone.progressLabel})` : `All ${milestones.length} earned`}
            descriptionNumberOfLines={2}
            left={(props) => <List.Icon {...props} icon="medal-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setSheet('milestones')}
          />
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <List.Item
            title="Reading history"
            description={history.length > 0 ? `${history.length} Kurals, most recent first` : 'Nothing read yet'}
            left={(props) => <List.Icon {...props} icon="history" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowHistory(true)}
          />
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <List.Item
            title="About the Thirukkural"
            description="The poet, the verse form and how the book is arranged"
            descriptionNumberOfLines={2}
            left={(props) => <List.Icon {...props} icon="book-information-variant" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowAbout(true)}
          />
        </Group>

        <SectionLabel>Settings</SectionLabel>
        <Group>
          <List.Item
            title="Appearance"
            description={summary.appearance}
            left={(props) => <List.Icon {...props} icon="palette-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setSheet('appearance')}
          />
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <List.Item
            title="Reading"
            description={summary.reading}
            left={(props) => <List.Icon {...props} icon="format-size" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setSheet('reading')}
          />
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <List.Item
            title="Listening voice"
            description={`${selectedVoiceIdentifier ? voiceName ?? 'Custom voice' : voiceName ? `Automatic · ${voiceName}` : 'Automatic'}\nChoose or download Tamil voices`}
            descriptionNumberOfLines={2}
            left={(props) => <List.Icon {...props} icon="account-voice" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowVoiceModal(true)}
          />
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <List.Item
            title="Reminders"
            description={summary.reminders}
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setSheet('reminders')}
          />
        </Group>

        <SectionLabel>More</SectionLabel>
        <Group>
          <List.Item
            title="Share Kural Daily"
            description="Invite a friend or family member to read along"
            left={(props) => <List.Icon {...props} icon="account-heart-outline" />}
            right={(props) => <List.Icon {...props} icon="share-variant-outline" />}
            onPress={() => Share.share({ message: SHARE_APP_MESSAGE }).catch(() => {})}
          />
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <List.Item
            title="Privacy policy"
            description="No accounts, no tracking, works offline"
            left={(props) => <List.Icon {...props} icon="shield-check-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPrivacyModal(true)}
          />
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <List.Item
            title="Source code"
            description="Kural Daily is open source (GPL-3.0)"
            left={(props) => <List.Icon {...props} icon="github" />}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
            onPress={() => Linking.openURL(REPO_URL).catch(() => {})}
          />
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          <List.Item
            title="Reset progress"
            description="Clears history, streaks, learning and quiz scores. Saved Kurals stay."
            descriptionNumberOfLines={2}
            titleStyle={{ color: theme.colors.error }}
            left={(props) => <List.Icon {...props} color={theme.colors.error} icon="restore" />}
            onPress={() => setShowResetDialog(true)}
          />
        </Group>

        <Text variant="labelSmall" style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
          {APP_NAME} {APP_VERSION} · {PUBLISHER}
        </Text>
      </ScrollView>

      <SheetModal visible={sheet === 'milestones'} onClose={() => setSheet(null)} title="Milestones" subtitle={`${earnedCount} of ${milestones.length} earned`}>
        <View style={styles.sheetGrid}>
          <MilestoneGrid milestones={milestones} />
        </View>
      </SheetModal>
      <AppearanceSheet visible={sheet === 'appearance'} onClose={() => setSheet(null)} />
      <ReadingSheet visible={sheet === 'reading'} onClose={() => setSheet(null)} />
      <RemindersSheet visible={sheet === 'reminders'} onClose={() => setSheet(null)} />
      <AboutKuralSheet visible={showAbout} onClose={() => setShowAbout(false)} />

      {/* Privacy policy: keep in step with PRIVACY.md */}
      <SheetModal visible={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Privacy policy" subtitle={`Last updated: ${PRIVACY_UPDATED}`}>
        <View style={styles.policy}>
          {PRIVACY_SECTIONS.map((section) => (
            <View key={section.heading}>
              <Text variant="titleMedium" style={styles.policyHeading}>{section.heading}</Text>
              <Text variant="bodyMedium" style={[styles.policyBody, { color: theme.colors.onSurfaceVariant }]}>
                {section.body}
              </Text>
            </View>
          ))}
          <Text variant="titleMedium" style={styles.policyHeading}>Open source and contact</Text>
          <Text variant="bodyMedium" style={[styles.policyBody, { color: theme.colors.onSurfaceVariant }]}>
            The source code is public, so anyone can check what the app does:{' '}
            <Text style={{ color: theme.colors.primary }} onPress={() => Linking.openURL(REPO_URL).catch(() => {})}>
              github.com/aatralabs/kural-daily
            </Text>
            . Questions: {PUBLISHER} · {CONTACT_EMAIL}
          </Text>
        </View>
      </SheetModal>

      <VoicePickerSheet visible={showVoiceModal} onClose={() => setShowVoiceModal(false)} />

      <Portal>

        {/* Reset confirmation */}
        <Dialog visible={showResetDialog} onDismiss={() => setShowResetDialog(false)}>
          <Dialog.Icon icon="restore" />
          <Dialog.Title style={{ textAlign: 'center' }}>Reset progress?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This clears your reading history, reading days, streaks, learning progress and quiz scores. Your saved Kurals and settings stay. This can&apos;t be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowResetDialog(false)}>Cancel</Button>
            <Button textColor={theme.colors.error} onPress={onReset}>Reset</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar(null)} duration={5000}>
        {snackbar}
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
  card: {
    marginHorizontal: space.lg,
    padding: space.lg,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  flameBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  best: {
    alignItems: 'center',
    minWidth: 44,
  },
  cardDivider: {
    marginVertical: space.md,
  },
  sheetGrid: {
    paddingTop: space.lg,
  },
  group: {
    marginHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
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
