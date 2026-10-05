import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, StyleSheet, FlatList, TouchableOpacity, BackHandler } from 'react-native';
import { Text, List, useTheme, Divider, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chapter, getChapters, getKuralsByChapter } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { KuralDetailModal } from '../../components/KuralDetailModal';

export default function BrowseScreen() {
  const theme = useTheme();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapterKurals, setChapterKurals] = useState<Kural[]>([]);
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);

  useEffect(() => {
    const allChapters = getChapters();
    setChapters(allChapters);
  }, []);

  const handleChapterPress = (chapter: Chapter) => {
    const kurals = getKuralsByChapter(chapter.number);
    setChapterKurals(kurals);
    setSelectedChapter(chapter);
  };

  const handleBack = () => {
    setSelectedChapter(null);
    setChapterKurals([]);
  };

  // Android back returns to the chapter list instead of leaving the tab
  useFocusEffect(
    useCallback(() => {
      if (!selectedChapter) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true;
      });
      return () => sub.remove();
    }, [selectedChapter])
  );

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
            {selectedChapter.number}. {selectedChapter.name}
          </Text>
        </View>
        <FlatList
          data={chapterKurals}
          keyExtractor={(item) => item.number.toString()}
          renderItem={renderKuralItem}
          contentContainerStyle={styles.listContent}
        />

        <KuralDetailModal kural={selectedKural} onClose={() => setSelectedKural(null)} />
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
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item }) => (
          <>
            <List.Item
              title={`${item.number}. ${item.name}`}
              description={item.nameEnglish}
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
});