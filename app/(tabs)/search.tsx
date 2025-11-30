import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Modal, ScrollView } from 'react-native';
import { Searchbar, Text, useTheme, Card, Portal, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchKurals } from '../../services/DataService';
import { getRandomKural } from '../../services/DailyService';
import { Kural } from '../../types/kural';
import { KuralCard } from '../../components/KuralCard';

export default function SearchScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Kural[]>([]);
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const searchResults = searchKurals(query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  const renderKuralItem = ({ item }: { item: Kural }) => (
    <Card style={styles.card} onPress={() => setSelectedKural(item)}>
      <Card.Content style={styles.cardContent}>
        <View>
          <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
            Kural {item.number}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', flex: 1, marginLeft: 16 }}>
          <Text variant="bodyMedium" numberOfLines={1} style={{ color: theme.colors.onSurface }}>
            {item.line1}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Search</Text>
        <Searchbar
          placeholder="Search Kural, number, or meaning..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderKuralItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          searchQuery.length > 2 ? (
            <Text style={styles.emptyText}>No results found.</Text>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Type at least 3 characters to search.</Text>
              <View style={styles.suggestionContainer}>
                <Text variant="titleMedium" style={styles.suggestionTitle}>Or try a random Kural:</Text>
                <Card style={styles.card} onPress={() => setSelectedKural(getRandomKural())}>
                  <Card.Content style={styles.cardContent}>
                    <View>
                      <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                        Surprise Me
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', flex: 1, marginLeft: 16 }}>
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                        Tap to view a random Kural
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            </View>
          )
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
    marginBottom: 16,
    fontFamily: 'Inter_700Bold',
  },
  searchBar: {
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
  },
  suggestionContainer: {
    marginTop: 40,
    paddingHorizontal: 16,
  },
  suggestionTitle: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.7,
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