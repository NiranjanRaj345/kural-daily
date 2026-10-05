import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Keyboard } from 'react-native';
import { Searchbar, Text, Chip, Button, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchKurals } from '../../services/DataService';
import { getRandomKural } from '../../services/DailyService';
import { Kural } from '../../types/kural';
import { KuralDetailModal } from '../../components/KuralDetailModal';
import { KuralListItem } from '../../components/ui/KuralListItem';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppTheme, space } from '../../theme';

const SUGGESTIONS = ['அன்பு', 'கல்வி', 'நட்பு', 'Friendship', 'Truth', 'Patience', 'Wealth', 'Kindness'];

const isSearchable = (query: string) => {
  const trimmed = query.trim();
  return trimmed.length > 2 || /^\d+$/.test(trimmed);
};

// Avoid re-filtering 1330 entries on every keystroke
const useDebounced = <T,>(value: T, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export default function SearchScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const recentSearches = useSettingsStore((s) => s.recentSearches);
  const addRecentSearch = useSettingsStore((s) => s.addRecentSearch);
  const clearRecentSearches = useSettingsStore((s) => s.clearRecentSearches);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);
  const [fromResults, setFromResults] = useState(false);

  const debouncedQuery = useDebounced(searchQuery, 150);
  const active = isSearchable(debouncedQuery);
  const results = useMemo(() => (active ? searchKurals(debouncedQuery) : []), [active, debouncedQuery]);

  const runSearch = (query: string) => {
    setSearchQuery(query);
    addRecentSearch(query);
    Keyboard.dismiss();
  };

  const openResult = useCallback((kural: Kural) => {
    if (isSearchable(searchQuery)) addRecentSearch(searchQuery);
    setFromResults(true);
    setSelectedKural(kural);
  }, [searchQuery, addRecentSearch]);

  const openRandom = () => {
    setFromResults(false);
    setSelectedKural(getRandomKural());
  };

  const renderIdle = () => (
    <View>
      {recentSearches.length > 0 && (
        <>
          <View style={styles.labelRow}>
            <SectionLabel style={styles.inlineLabel}>Recent</SectionLabel>
            <Button compact onPress={clearRecentSearches} style={styles.clearButton}>Clear</Button>
          </View>
          <View style={styles.chips}>
            {recentSearches.map((q) => (
              <Chip key={q} icon="history" onPress={() => runSearch(q)}>{q}</Chip>
            ))}
          </View>
        </>
      )}
      <SectionLabel>Try a topic</SectionLabel>
      <View style={styles.chips}>
        {SUGGESTIONS.map((q) => (
          <Chip key={q} mode="outlined" onPress={() => runSearch(q)}>{q}</Chip>
        ))}
      </View>
      <EmptyState
        icon="text-search"
        title="Search all 1330 Kurals"
        message="Type a word in Tamil or English, a chapter name, or a Kural number like 391."
        actionLabel="Surprise me"
        onAction={openRandom}
      />
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))} accessibilityLabel="Back" />
        <Text variant="headlineMedium" accessibilityRole="header" style={{ color: theme.colors.onBackground }}>
          Search
        </Text>
      </View>
      <Searchbar
        placeholder="Word, chapter or number"
        onChangeText={setSearchQuery}
        onSubmitEditing={() => isSearchable(searchQuery) && addRecentSearch(searchQuery)}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
        inputStyle={styles.searchInput}
        returnKeyType="search"
        autoCorrect={false}
        autoFocus
        accessibilityLabel="Search Kurals"
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item }) => <KuralListItem kural={item} onPress={openResult} showChapter />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={12}
        ListHeaderComponent={
          active && results.length > 0 ? (
            <Text variant="labelMedium" style={[styles.count, { color: theme.colors.onSurfaceVariant }]}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          active ? (
            <EmptyState
              icon="magnify-close"
              title="No matches"
              message={`Nothing found for “${debouncedQuery.trim()}”. Try a shorter word or the other language.`}
            />
          ) : renderIdle()
        }
      />

      <KuralDetailModal
        kural={selectedKural}
        onClose={() => setSelectedKural(null)}
        sequence={fromResults ? results : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: space.xs,
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
  searchBar: {
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    elevation: 0,
  },
  searchInput: {
    fontFamily: 'Inter_400Regular',
  },
  listContent: {
    paddingTop: space.sm,
    paddingBottom: space.xxxl,
  },
  count: {
    paddingHorizontal: space.xl,
    paddingBottom: space.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: space.md,
  },
  inlineLabel: {
    paddingBottom: space.sm,
  },
  clearButton: {
    marginTop: space.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
});
