import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text, List, useTheme, Divider, Card, Portal, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChapters, getKuralsByChapter } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { KuralCard } from '../../components/KuralCard';

export default function BrowseScreen() {
  const theme = useTheme();
  const [chapters, setChapters] = useState<string[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [chapterKurals, setChapterKurals] = useState<Kural[]>([]);
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);

  useEffect(() => {
    const allChapters = getChapters();
    setChapters(allChapters);
  }, []);

  const handleChapterPress = (chapter: string) => {
    const kurals = getKuralsByChapter(chapter);
    setChapterKurals(kurals);
    setSelectedChapter(chapter);
  };

  const handleBack = () => {
    setSelectedChapter(null);
    setChapterKurals([]);
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

  if (selectedChapter) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>← Back</Text>
          </TouchableOpacity>
          <Text variant="headlineSmall" style={styles.headerTitle} numberOfLines={1}>
            {selectedChapter}
          </Text>
        </View>
        <FlatList
          data={chapterKurals}
          keyExtractor={(item) => item.number.toString()}
          renderItem={renderKuralItem}
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
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Browse Chapters</Text>
      </View>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <>
            <List.Item
              title={item}
              left={props => <List.Icon {...props} icon="book-open-variant" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => handleChapterPress(item)}
            />
            <Divider />
          </>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
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
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
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