import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, BackHandler, Linking, Platform } from 'react-native';
import { List, Switch, Text, useTheme, Divider, SegmentedButtons, Avatar, Card, IconButton, Portal, Dialog, RadioButton, Button, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Constants from 'expo-constants';
import * as Speech from 'expo-speech';
import { useSettingsStore } from '../../store/useSettingsStore';
import {
  enableDailyReminders, disableDailyReminders, syncDailyReminders, formatReminderTime,
} from '../../services/NotificationService';
import { getKuralByNumber } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { KuralDetailModal } from '../../components/KuralDetailModal';
import { SheetModal } from '../../components/SheetModal';

const REMINDER_TIMES: [number, number][] = [
  [6, 0], [7, 0], [8, 0], [9, 0], [12, 0], [18, 0], [20, 0], [21, 0],
];

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function ProfileScreen() {
  const theme = useTheme();
  const {
    themeMode, setThemeMode,
    showEnglish, toggleEnglish,
    showTamil, toggleTamil,
    notificationsEnabled, notificationHour, notificationMinute, setNotificationTime,
    fontSize, setFontSize,
    streak, history,
    selectedVoiceIdentifier, setSelectedVoiceIdentifier
  } = useSettingsStore();

  const [showHistory, setShowHistory] = useState(false);
  const [historyKurals, setHistoryKurals] = useState<Kural[]>([]);
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);
  const [allVoices, setAllVoices] = useState<Speech.Voice[]>([]);
  const [showAllVoices, setShowAllVoices] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{ message: string; openSettings?: boolean } | null>(null);

  const loadVoices = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      setAllVoices(voices);
    } catch (error) {
      console.error("Failed to load voices", error);
    }
  };

  const displayedVoices = React.useMemo(() => {
    if (showAllVoices) return allVoices;
    const tamil = allVoices.filter(v =>
      (v.language && v.language.toLowerCase().includes('ta')) ||
      (v.name && v.name.toLowerCase().includes('tamil'))
    );
    // If no Tamil voices found, show all by default so the list isn't empty
    return tamil.length > 0 ? tamil : allVoices;
  }, [allVoices, showAllVoices]);

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    if (showVoiceModal) {
      loadVoices();
    }
  }, [showVoiceModal]);

  const handleVoicePreview = (voiceIdentifier: string) => {
    Speech.stop();
    Speech.speak('வணக்கம், இது திருக்குறள்', {
      language: 'ta-IN',
      voice: voiceIdentifier,
    });
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

  const handleHistoryPress = () => {
    const kurals = history
      .map(id => getKuralByNumber(id))
      .filter((k): k is Kural => k !== undefined);
    setHistoryKurals(kurals);
    setShowHistory(true);
  };

  const renderHistoryItem = ({ item }: { item: Kural }) => (
    <Card style={styles.historyCard} onPress={() => setSelectedKural(item)}>
      <Card.Content style={styles.historyCardContent}>
        <View>
          <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            Kural {item.number}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
            {item.chap_tam}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            {item.sect_tam}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (showHistory) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.backButton}>
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>← Back</Text>
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            Reading History
          </Text>
        </View>
        <FlatList
          data={historyKurals}
          keyExtractor={(item) => item.number.toString()}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.listContent}
        />

        <KuralDetailModal kural={selectedKural} onClose={() => setSelectedKural(null)} />

      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>My Profile</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsContent}>
              <View style={styles.statItem}>
                <Avatar.Icon size={48} icon="fire" style={{ backgroundColor: '#FF5722' }} />
                <Text variant="headlineMedium" style={styles.statValue}>{streak}</Text>
                <Text variant="labelMedium" style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Avatar.Icon size={48} icon="book-open-page-variant" style={{ backgroundColor: theme.colors.primary }} />
                <Text variant="headlineMedium" style={styles.statValue}>{history.length}</Text>
                <Text variant="labelMedium" style={styles.statLabel}>Kurals Read</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        <List.Section>
          <List.Subheader>Activity</List.Subheader>
          <List.Item
            title="Reading History"
            description="View recently read Kurals"
            left={props => <List.Icon {...props} icon="history" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleHistoryPress}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <View style={styles.settingRow}>
            <Text variant="bodyLarge" style={{ marginLeft: 16, marginBottom: 8 }}>Theme</Text>
            <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
              <SegmentedButtons
                value={themeMode}
                onValueChange={(val) => setThemeMode(val as 'light' | 'dark' | 'sepia')}
                buttons={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'sepia', label: 'Sepia' },
                ]}
              />
            </View>
          </View>
          <View style={styles.settingRow}>
            <Text variant="bodyLarge" style={{ marginLeft: 16, marginBottom: 8 }}>Font Size</Text>
            <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
              <SegmentedButtons
                value={fontSize.toString()}
                onValueChange={(val) => setFontSize(parseInt(val))}
                buttons={[
                  { value: '20', label: 'Small' },
                  { value: '24', label: 'Medium' },
                  { value: '28', label: 'Large' },
                ]}
              />
            </View>
          </View>
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Daily Reminder"
            description={notificationsEnabled
              ? `Today's Kural at ${formatReminderTime(notificationHour, notificationMinute)}`
              : 'Off'}
            left={() => <List.Icon icon="bell-outline" />}
            right={() => <Switch value={notificationsEnabled} onValueChange={onToggleNotifications} />}
          />
          {notificationsEnabled && (
            <List.Item
              title="Reminder Time"
              description={formatReminderTime(notificationHour, notificationMinute)}
              left={() => <List.Icon icon="clock-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setShowTimeDialog(true)}
            />
          )}
          <List.Item
            title="Show Tamil"
            left={() => <List.Icon icon="syllabary-hangul" />}
            right={() => <Switch value={showTamil} onValueChange={toggleTamil} />}
          />
          <List.Item
            title="Show English Meaning"
            left={() => <List.Icon icon="translate" />}
            right={() => <Switch value={showEnglish} onValueChange={toggleEnglish} />}
          />
          <List.Item
            title="Audio Voice"
            description={selectedVoiceIdentifier ? "Custom voice selected" : "Default system voice"}
            left={props => <List.Icon {...props} icon="account-voice" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowVoiceModal(true)}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="Privacy Policy"
            description="Read our data handling policy"
            left={() => <List.Icon icon="shield-check-outline" />}
            onPress={() => setShowPrivacyModal(true)}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Version"
            description={APP_VERSION}
            left={() => <List.Icon icon="information-outline" />}
          />
        </List.Section>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Privacy Policy Modal */}
      <SheetModal visible={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Privacy Policy">
        <View style={{ padding: 20 }}>
          <Text variant="titleLarge" style={{ marginBottom: 10, fontWeight: 'bold' }}>Data Collection</Text>
          <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
            We do not collect, store, or share any personal information. There are no accounts, ads, analytics or tracking. The app works fully offline.
          </Text>

          <Text variant="titleLarge" style={{ marginBottom: 10, fontWeight: 'bold' }}>Local Storage</Text>
          <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
            All user preferences (theme, history, favorites, streaks, quiz scores) are stored locally on your device. This data never leaves your phone and is removed when you uninstall the app.
          </Text>

          <Text variant="titleLarge" style={{ marginBottom: 10, fontWeight: 'bold' }}>Permissions</Text>
          <Text variant="bodyMedium" style={{ marginBottom: 20 }}>
            • Notifications (optional): Used only for the daily reminder, scheduled locally on your device. Requested only when you turn reminders on.{'\n'}
            • Sharing: Kural images are created on your device and passed to the share sheet you choose. No storage permission is needed.
          </Text>

          <Text variant="bodySmall" style={{ marginTop: 20, color: theme.colors.secondary, textAlign: 'center' }}>
            Last Updated: October 5, 2026
          </Text>
        </View>
      </SheetModal>

      {/* Voice Selection Modal */}
      <SheetModal
        visible={showVoiceModal}
        onClose={() => { Speech.stop(); setShowVoiceModal(false); }}
        title="Select Voice"
        scrollable={false}
        headerRight={<IconButton icon="refresh" onPress={loadVoices} accessibilityLabel="Refresh voices" />}
      >
          <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surfaceVariant }}>
            <Text variant="bodyMedium">Show all languages</Text>
            <Switch value={showAllVoices} onValueChange={setShowAllVoices} />
          </View>
          <FlatList
            data={displayedVoices}
            keyExtractor={(item) => item.identifier}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={() => (
              <>
                <View style={{ padding: 16, paddingBottom: 8 }}>
                  <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
                    Found {allVoices.length} voices available
                  </Text>
                </View>
                <List.Item
                  title="System Default"
                  description="Use device preference"
                  onPress={() => setSelectedVoiceIdentifier(null)}
                  right={props => !selectedVoiceIdentifier ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
                />
                <Divider />
              </>
            )}
            renderItem={({ item }) => (
              <>
                <List.Item
                  title={item.name}
                  description={item.language}
                  onPress={() => setSelectedVoiceIdentifier(item.identifier)}
                  right={props => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <IconButton
                        icon="play-circle-outline"
                        onPress={() => handleVoicePreview(item.identifier)}
                      />
                      {selectedVoiceIdentifier === item.identifier && (
                        <List.Icon {...props} icon="check" color={theme.colors.primary} />
                      )}
                    </View>
                  )}
                />
                <Divider />
              </>
            )}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', marginTop: 20, padding: 16 }}>
                <Text style={{ textAlign: 'center', color: theme.colors.secondary, marginBottom: 10 }}>
                  No voices detected.
                </Text>
                <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.outline }}>
                  Try tapping the refresh button above.
                </Text>
              </View>
            )}
          />
      </SheetModal>

      {/* Reminder Time Dialog */}
      <Portal>
        <Dialog visible={showTimeDialog} onDismiss={() => setShowTimeDialog(false)}>
          <Dialog.Title>Reminder Time</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 360 }}>
            <ScrollView>
              <RadioButton.Group
                onValueChange={onSelectReminderTime}
                value={`${notificationHour}:${notificationMinute}`}
              >
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
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    marginLeft: 16,
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsCard: {
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#eee',
  },
  settingRow: {
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  historyCard: {
    marginBottom: 12,
    elevation: 1,
  },
  historyCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
});