import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, StyleSheet, FlatList, SectionList, Pressable, BackHandler } from 'react-native';
import { Text, IconButton, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Chapter, getChapters, getKuralsByChapter } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { KuralDetailModal } from '../../components/KuralDetailModal';
import { KuralListItem } from '../../components/ui/KuralListItem';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppTheme, space, radius, tamilText } from '../../theme';

interface Book {
  title: string;
  titleEnglish?: string;
  data: Chapter[];
}

// The three books (பால்): Virtue, Wealth, Love
const books: Book[] = getChapters().reduce<Book[]>((acc, chapter) => {
  const last = acc[acc.length - 1];
  if (last && last.title === chapter.section) {
    last.data.push(chapter);
  } else {
    acc.push({ title: chapter.section, titleEnglish: chapter.sectionEnglish, data: [chapter] });
  }
  return acc;
}, []);

const ChapterRow = React.memo(function ChapterRow({
  chapter, readCount, onPress,
}: { chapter: Chapter; readCount: number; onPress: (c: Chapter) => void }) {
  const theme = useAppTheme();
  const complete = readCount >= 10;
  return (
    <Pressable
      onPress={() => onPress(chapter)}
      accessibilityRole="button"
      accessibilityLabel={`Chapter ${chapter.number}, ${chapter.name}, ${chapter.nameEnglish ?? ''}. ${readCount} of 10 read`}
      android_ripple={{ color: theme.colors.primaryContainer }}
      style={({ pressed }) => [styles.chapterRow, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View
        style={[
          styles.chapterBadge,
          { backgroundColor: complete ? theme.colors.successContainer : theme.colors.surfaceVariant },
        ]}
      >
        {complete ? (
          <MaterialCommunityIcons name="check" size={18} color={theme.colors.onSuccessContainer} />
        ) : (
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>{chapter.number}</Text>
        )}
      </View>
      <View style={styles.chapterText}>
        <Text style={[tamilText.title, { color: theme.colors.onSurface }]} numberOfLines={1}>{chapter.name}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
          {chapter.nameEnglish}
        </Text>
      </View>
      {readCount > 0 && !complete && (
        <Text variant="labelSmall" style={{ color: theme.colors.primary }}>{readCount}/10</Text>
      )}
      <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.outline} />
    </Pressable>
  );
});

export default function BrowseScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const history = useSettingsStore((s) => s.history);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);
  const [bookFilter, setBookFilter] = useState<string | null>(null);
  const visibleBooks = useMemo(
    () => (bookFilter ? books.filter((b) => b.title === bookFilter) : books),
    [bookFilter]
  );

  const readSet = useMemo(() => new Set(history), [history]);
  const readByChapter = useMemo(() => {
    const counts = new Map<number, number>();
    for (const n of history) {
      const chapter = Math.ceil(n / 10);
      counts.set(chapter, (counts.get(chapter) ?? 0) + 1);
    }
    return counts;
  }, [history]);

  const chapterKurals = useMemo(
    () => (selectedChapter ? getKuralsByChapter(selectedChapter.number) : []),
    [selectedChapter]
  );

  const handleBack = useCallback(() => setSelectedChapter(null), []);
  const openChapter = useCallback((chapter: Chapter) => setSelectedChapter(chapter), []);
  const openKural = useCallback((kural: Kural) => setSelectedKural(kural), []);

  // Android back returns to the chapter list instead of leaving the tab
  useFocusEffect(
    useCallback(() => {
      if (!selectedChapter) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true;
      });
      return () => sub.remove();
    }, [selectedChapter, handleBack])
  );

  if (selectedChapter) {
    const index = selectedChapter.number;
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.chapterHeader}>
          <IconButton icon="arrow-left" onPress={handleBack} accessibilityLabel="Back to chapters" />
          <View style={{ flex: 1 }}>
            <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
              Chapter {index} · {selectedChapter.sectionEnglish}
            </Text>
            <Text style={[tamilText.title, { fontSize: 20, lineHeight: 30, color: theme.colors.onBackground }]} numberOfLines={1}>
              {selectedChapter.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
              {selectedChapter.nameEnglish}
            </Text>
          </View>
          <IconButton
            icon="chevron-left"
            disabled={index <= 1}
            onPress={() => setSelectedChapter(getChapters()[index - 2])}
            accessibilityLabel="Previous chapter"
          />
          <IconButton
            icon="chevron-right"
            disabled={index >= getChapters().length}
            onPress={() => setSelectedChapter(getChapters()[index])}
            accessibilityLabel="Next chapter"
          />
        </View>
        <FlatList
          key={index}
          data={chapterKurals}
          keyExtractor={(item) => item.number.toString()}
          renderItem={({ item }) => (
            <KuralListItem kural={item} onPress={openKural} read={readSet.has(item.number)} />
          )}
          contentContainerStyle={styles.listContent}
        />

        <KuralDetailModal kural={selectedKural} onClose={() => setSelectedKural(null)} sequence={chapterKurals} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Browse"
        subtitle="3 books · 133 chapters · 1330 Kurals"
        right={
          <IconButton
            icon="magnify"
            mode="contained-tonal"
            onPress={() => router.navigate('/search')}
            accessibilityLabel="Search Kurals"
          />
        }
      />
      <View style={styles.bookChips}>
        <Chip compact selected={!bookFilter} showSelectedOverlay onPress={() => setBookFilter(null)} style={styles.bookChip}>
          All
        </Chip>
        {books.map((book) => (
          <Chip
            key={book.title}
            compact
            selected={bookFilter === book.title}
            showSelectedOverlay
            onPress={() => setBookFilter(bookFilter === book.title ? null : book.title)}
            style={styles.bookChip}
          >
            {book.titleEnglish ?? book.title}
          </Chip>
        ))}
      </View>
      <SectionList
        key={bookFilter ?? 'all'}
        sections={visibleBooks}
        keyExtractor={(item) => item.number.toString()}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={[styles.bookHeader, { backgroundColor: theme.colors.background }]}>
            <Text style={[tamilText.title, { color: theme.colors.primary }]}>{section.title}</Text>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {section.titleEnglish} · {section.data.length} chapters
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View
            style={[
              styles.chapterGroup,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outlineVariant,
                borderTopLeftRadius: index === 0 ? radius.lg : 0,
                borderTopRightRadius: index === 0 ? radius.lg : 0,
                borderBottomLeftRadius: index === section.data.length - 1 ? radius.lg : 0,
                borderBottomRightRadius: index === section.data.length - 1 ? radius.lg : 0,
                borderTopWidth: index === 0 ? StyleSheet.hairlineWidth : 0,
                borderBottomWidth: index === section.data.length - 1 ? StyleSheet.hairlineWidth : 0,
              },
            ]}
          >
            {(index === 0 || section.data[index - 1].group !== item.group) ? (
              <View style={[styles.groupLabel, index > 0 && { borderTopColor: theme.colors.outlineVariant, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <Text style={[tamilText.labelStrong, { color: theme.colors.primary }]}>{item.group}</Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.groupEnglish}</Text>
              </View>
            ) : (
              <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            )}
            <ChapterRow chapter={item} readCount={readByChapter.get(item.number) ?? 0} onPress={openChapter} />
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: space.xxxl,
  },
  bookChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingHorizontal: space.xl,
    paddingBottom: space.sm,
  },
  bookChip: {
    borderRadius: radius.pill,
  },
  bookHeader: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  chapterGroup: {
    marginHorizontal: space.lg,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  groupLabel: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xs,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  chapterBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterText: {
    flex: 1,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: space.xs,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
});
