import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { getBookStructure, getChapters, getKuralByNumber, TOTAL_KURALS } from '../services/DataService';
import { SheetModal } from './SheetModal';
import { KuralVerse } from './KuralVerse';
import { useAppTheme, space, radius, useType } from '../theme';

interface AboutKuralSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** What the Thirukkural is, who wrote it and how it is arranged. Counts and structure come from the data itself. */
export const AboutKuralSheet: React.FC<AboutKuralSheetProps> = ({ visible, onClose }) => {
  const theme = useAppTheme();
  const type = useType();
  const books = useMemo(() => getBookStructure(), []);
  const example = getKuralByNumber(391)!;
  const chapterCount = getChapters().length;

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <Text variant="titleMedium" accessibilityRole="header" style={[styles.heading, { color: theme.colors.onSurface }]}>
      {children}
    </Text>
  );
  const Para = ({ children }: { children: React.ReactNode }) => (
    <Text variant="bodyMedium" style={[styles.para, { color: theme.colors.onSurfaceVariant }]}>{children}</Text>
  );
  const T = ({ children }: { children: React.ReactNode }) => (
    // Tamil words inside English text: the Tamil face at the surrounding size
    <Text style={{ ...type.tamilLabelStrong, fontSize: undefined, lineHeight: undefined, color: theme.colors.onSurface }}>{children}</Text>
  );

  const facts: { value: string; label: string }[] = [
    { value: String(TOTAL_KURALS), label: 'Kurals' },
    { value: String(chapterCount), label: 'chapters of 10' },
    { value: String(books.length), label: 'books (பால்)' },
    { value: '4 + 3', label: 'feet per couplet' },
  ];

  return (
    <SheetModal visible={visible} onClose={onClose} title="About the Thirukkural" subtitle="திருக்குறள்">
      <View style={styles.body}>
        <Text variant="bodyLarge" style={[styles.para, { color: theme.colors.onSurface }]}>
          The Thirukkural is a book of {TOTAL_KURALS} short couplets on how to live well, by the poet
          Thiruvalluvar (திருவள்ளுவர்). In a few words each, it speaks of right conduct, of work and public
          life, and of love. It is written for everyone and belongs to no one religion or sect, which is why it is
          called <T>உலகப் பொதுமறை</T>, the common scripture of the world.
        </Text>

        <View style={styles.facts}>
          {facts.map((f) => (
            <View key={f.label} style={[styles.fact, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
              <Text style={[type.display(22), { color: theme.colors.primary }]}>{f.value}</Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{f.label}</Text>
            </View>
          ))}
        </View>

        <Heading>The poet</Heading>
        <Para>
          Almost nothing is known for certain about Thiruvalluvar&apos;s life; the stories told about him come
          from later tradition. He is honoured with titles such as <T>தெய்வப்புலவர்</T> (the divine poet) and{' '}
          <T>பொய்யில் புலவர்</T> (the poet whose word never fails). Scholars date the work anywhere from about the
          3rd century BCE to the 5th century CE. The Tamil calendar year named after him,{' '}
          <T>திருவள்ளுவர் ஆண்டு</T>, counts from 31 BCE.
        </Para>

        <Heading>Its names</Heading>
        <Para>
          <T>திருக்குறள்</T>: <Text style={{ fontStyle: 'italic' }}>திரு</Text> (sacred, honoured) and{' '}
          <Text style={{ fontStyle: 'italic' }}>குறள்</Text> (short), after its short verse form.{'\n'}
          <T>முப்பால்</T>: the three-fold work, for its three books.{'\n'}
          <T>உலகப் பொதுமறை</T>, <T>பொய்யாமொழி</T> and <T>தமிழ்மறை</T> are among its other names.
        </Para>
        <Para>
          It is one of the <T>பதினெண்கீழ்க்கணக்கு</T>, the eighteen shorter works of Tamil literature that
          teach how to live, and it is by far the most widely read of them.
        </Para>

        <Heading>The couplet</Heading>
        <Para>
          Every Kural is a <T>குறள் வெண்பா</T>: two lines, four feet (<T>சீர்</T>) in the first and three in
          the second, seven in all, written in the strict <T>வெண்பா</T> metre. One complete thought in each. For example:
        </Para>
        <View style={[styles.example, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
          <KuralVerse kural={example} size={18} showFeet />
          <Text style={[type.translation, styles.exampleTranslation, { color: theme.colors.onSurfaceVariant }]}>
            {example.eng}
          </Text>
          <Text variant="labelSmall" style={[styles.exampleMeta, { color: theme.colors.onSurfaceVariant }]}>
            Kural {example.number} · {example.chap_tam} ({example.chap_eng})
          </Text>
        </View>
        <Para>
          The book opens with <T>அ</T>, the first letter of the Tamil alphabet (<T>அகர முதல</T>…), and its last
          Kural ends with <T>ன்</T>, the alphabet&apos;s last letter.
        </Para>

        <Heading>How it is arranged</Heading>
        <Para>
          {TOTAL_KURALS} Kurals make {chapterCount} chapters (<T>அதிகாரம்</T>) of ten, gathered into three books (
          <T>பால்</T>): virtue, wealth and love. Within the books, chapters are grouped into parts (<T>இயல்</T>).
          Commentators group the parts in slightly different ways; this is the grouping used in the app.
        </Para>

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

        <Heading>Commentaries and translations</Heading>
        <Para>
          Tradition remembers ten medieval commentators (<T>பதின்மர்</T>). Of their commentaries,
          Parimelazhagar&apos;s (<T>பரிமேலழகர்</T>, 13th century) became the most influential, and many modern
          commentaries have followed. The Kural reached Europe early: Constanzo Beschi (<T>வீரமாமுனிவர்</T>)
          put its first two books into Latin in the 1730s, and G. U. Pope published a complete English
          translation in 1886. It has since been translated into dozens of languages.
        </Para>
        <Para>
          At Kanyakumari, at the southern tip of India, a statue of Thiruvalluvar has stood on a rock in the sea
          since 2000. With its pedestal it is 133 feet high, one foot for each chapter.
        </Para>

        <Heading>In this app</Heading>
        <Para>
          The Tamil explanation (<T>உரை</T>) is by Mu. Varadarasanar (<T>மு. வரதராசனார்</T>, 1912–1974), the
          scholar and novelist whose clear, simple commentary is among the most read today. Each Kural also has
          a rhymed English rendering and a plain English explanation.
        </Para>
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
  exampleTranslation: {
    marginTop: space.md,
  },
  exampleMeta: {
    marginTop: space.sm,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.md,
  },
  fact: {
    flexGrow: 1,
    flexBasis: '45%',
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
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
