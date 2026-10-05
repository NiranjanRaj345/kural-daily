import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { getBookStructure, getKuralByNumber } from '../services/DataService';
import { SheetModal } from './SheetModal';
import { KuralVerse } from './KuralVerse';
import { useAppTheme, space, radius, useType } from '../theme';

interface AboutKuralSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** What the Thirukkural is and how it is arranged. The structure is read from the data itself. */
export const AboutKuralSheet: React.FC<AboutKuralSheetProps> = ({ visible, onClose }) => {
  const theme = useAppTheme();
  const type = useType();
  const books = useMemo(() => getBookStructure(), []);
  const example = getKuralByNumber(391)!;

  return (
    <SheetModal visible={visible} onClose={onClose} title="About the Thirukkural" subtitle="திருக்குறள்">
      <View style={styles.body}>
        <Text variant="bodyLarge" style={[styles.para, { color: theme.colors.onSurface }]}>
          The Thirukkural is a classic of Tamil literature by the poet Thiruvalluvar, generally dated to
          around two thousand years ago. It is also called the முப்பால், &ldquo;the three-fold work&rdquo;,
          for its three books on virtue, wealth and love.
        </Text>

        <Text variant="titleMedium" style={[styles.heading, { color: theme.colors.onSurface }]}>The couplet</Text>
        <Text variant="bodyMedium" style={[styles.para, { color: theme.colors.onSurfaceVariant }]}>
          Every Kural is a குறள் வெண்பா: two lines, four feet (சீர்) in the first and three in the second.
          Seven words, one complete thought. For example:
        </Text>
        <View style={[styles.example, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          <KuralVerse kural={example} size={18} showFeet />
          <Text variant="labelSmall" style={[styles.exampleMeta, { color: theme.colors.onSurfaceVariant }]}>
            Kural {example.number} · {example.chap_tam}
          </Text>
        </View>

        <Text variant="titleMedium" style={[styles.heading, { color: theme.colors.onSurface }]}>How it is arranged</Text>
        <Text variant="bodyMedium" style={[styles.para, { color: theme.colors.onSurfaceVariant }]}>
          1330 Kurals make up 133 chapters (அதிகாரம்) of ten each. The chapters are grouped into parts (இயல்)
          within the three books (பால்).
        </Text>

        {books.map((book) => (
          <View key={book.name} style={[styles.book, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            <View style={styles.bookHead}>
              <Text style={[type.tamilTitle, { color: theme.colors.primary }]}>{book.name}</Text>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {book.nameEnglish} · {book.chapters} chapters · {book.kurals} Kurals
              </Text>
            </View>
            {book.groups.map((g) => (
              <View key={g.name} style={[styles.group, { borderTopColor: theme.colors.outlineVariant }]}>
                <Text style={[type.tamilLabel, { color: theme.colors.onSurface, flex: 1 }]}>
                  {g.name} <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{g.nameEnglish}</Text>
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {g.chapters} {g.chapters === 1 ? 'chapter' : 'chapters'}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text variant="titleMedium" style={[styles.heading, { color: theme.colors.onSurface }]}>In this app</Text>
        <Text variant="bodyMedium" style={[styles.para, { color: theme.colors.onSurfaceVariant }]}>
          The Tamil explanation is by Mu. Varadarasanar (மு. வரதராசனார்). English translations and explanations
          accompany each Kural.
        </Text>
      </View>
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
  heading: {
    marginTop: space.lg,
  },
  para: {
    lineHeight: 24,
  },
  example: {
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: space.xs,
  },
  exampleMeta: {
    marginTop: space.sm,
  },
  book: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginTop: space.sm,
  },
  bookHead: {
    padding: space.lg,
    paddingBottom: space.md,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
