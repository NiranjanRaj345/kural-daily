import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal } from 'react-native';
import { List, Switch, Text, useTheme, Divider, SegmentedButtons, Avatar, Card, IconButton, Portal, RadioButton, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { useSettingsStore } from '../../store/useSettingsStore';
import { scheduleDailyNotification, cancelAllNotifications } from '../../services/NotificationService';
import { getKuralByNumber } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { KuralCard } from '../../components/KuralCard';

export default function ProfileScreen() {
  const theme = useTheme();
  const {
    themeMode, setThemeMode,
    showEnglish, toggleEnglish,
    showTamil, toggleTamil,
    notificationsEnabled, toggleNotifications,
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
    const newState = !notificationsEnabled;
    toggleNotifications();
    if (newState) {
      await scheduleDailyNotification();
    } else {
      await cancelAllNotifications();
    }
  };

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

        {/* Full Kural Modal */}
        <Portal>
          <Modal
            visible={!!selectedKural}
            onDismiss={() => setSelectedKural(null)}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text variant="titleMedium">Kural Detail</Text>
                  <IconButton icon="close" onPress={() => setSelectedKural(null)} />
                </View>
                <ScrollView>
                  {selectedKural && <KuralCard kural={selectedKural} />}
                  <View style={{ height: 20 }} />
                </ScrollView>
              </View>
            </View>
          </Modal>
        </Portal>

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
            title="Daily Notifications"
            description="Get reminded at 9:00 AM"
            left={() => <List.Icon icon="bell-outline" />}
            right={() => <Switch value={notificationsEnabled} onValueChange={onToggleNotifications} />}
          />
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
          <TouchableRipple onPress={() => setShowVoiceModal(true)}>
            <List.Item
              title="Audio Voice"
              description={selectedVoiceIdentifier ? "Custom voice selected" : "Default system voice"}
              left={props => <List.Icon {...props} icon="account-voice" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableRipple>
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={() => <List.Icon icon="information-outline" />}
          />
        </List.Section>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Voice Selection Modal */}
      <Portal>
        <Modal
          visible={showVoiceModal}
          onDismiss={() => setShowVoiceModal(false)}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
              <View style={styles.modalHeader}>
                <Text variant="titleMedium">Select Voice</Text>
                <View style={{ flexDirection: 'row' }}>
                  <IconButton icon="refresh" onPress={loadVoices} />
                  <IconButton icon="close" onPress={() => setShowVoiceModal(false)} />
                </View>
              </View>
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
            </View>
          </View>
        </Modal>
      </Portal>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});