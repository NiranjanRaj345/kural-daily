import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Modal, ScrollView } from 'react-native';
import { Text, useTheme, Card, Portal, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getKuralByNumber } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { KuralCard } from '../../components/KuralCard';

export default function FavoritesScreen() {
  const theme = useTheme();
  const { favorites } = useSettingsStore();
  const [favoriteKurals, setFavoriteKurals] = useState<Kural[]>([]);
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);

  useEffect(() => {
    const kurals = favorites
      .map(id => getKuralByNumber(id))
      .filter((k): k is Kural => k !== undefined);
    setFavoriteKurals(kurals);
  }, [favorites]);

  const renderFavoriteItem = ({ item }: { item: Kural }) => (
    <Card style={styles.card} onPress={() => setSelectedKural(item)}>
      <Card.Content style={styles.cardContent}>
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Favorites</Text>
      </View>

      <FlatList
        data={favoriteKurals}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No favorites yet.
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubText}>
              Tap the heart icon on a Kural to save it here.
            </Text>
          </View>
        }
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubText: {
    textAlign: 'center',
    color: '#888',
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