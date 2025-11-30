import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Modal } from 'react-native';
import { Text, useTheme, ActivityIndicator, Chip, Button, Portal, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { KuralCard } from '../../components/KuralCard';
import { getDailyKural, getRandomKural } from '../../services/DailyService';
import { Kural } from '../../types/kural';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function HomeScreen() {
  const theme = useTheme();
  const { streak, updateStreak } = useSettingsStore();
  const [dailyKural, setDailyKural] = useState<Kural | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [randomKural, setRandomKural] = useState<Kural | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadKural = async () => {
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
  };

  useEffect(() => {
    loadKural();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // In a real app, this might fetch new data from a server
    // For now, it just re-runs the local logic
    loadKural();
  }, []);

  const handleRandomKural = () => {
    const kural = getRandomKural();
    setRandomKural(kural);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={{ marginTop: 16, color: theme.colors.secondary }}>
          Loading today's wisdom...
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

        {dailyKural ? (
          <KuralCard kural={dailyKural} />
        ) : (
          <Text style={styles.errorText}>Could not load today's Kural.</Text>
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

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
              <View style={styles.modalHeader}>
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Random Kural</Text>
                <IconButton icon="close" onPress={() => setModalVisible(false)} />
              </View>
              <ScrollView>
                {randomKural && <KuralCard kural={randomKural} />}
                <View style={{ height: 20 }} />
              </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
