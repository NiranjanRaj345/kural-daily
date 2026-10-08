import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getKuralByNumber } from '../../services/DataService';
import { getDailyKural } from '../../services/DailyService';
import { Kural } from '../../types/kural';
import { MemorizeSheet, MemorizeMode } from '../../components/MemorizeSheet';
import { QuizPanel } from '../../components/QuizPanel';
import { KuralListItem } from '../../components/ui/KuralListItem';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { Stats } from '../../components/ui/Stats';
import { BOX_INTERVALS, dueKurals, learningSummary } from '../../utils/srs';
import { toLocalDateKey } from '../../utils/date';
import { useAppTheme, useType, space, radius } from '../../theme';

const formatDue = (dueKey: string, todayKey: string) => {
  if (dueKey <= todayKey) return 'Due now';
  const [y, m, d] = dueKey.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const [ty, tm, td] = todayKey.split('-').map(Number);
  const days = Math.round((due.getTime() - new Date(ty, tm - 1, td).getTime()) / 86400000);
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  return due.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

/** Seven dots, one per Leitner box, filled up to the Kural's current box. */
const BoxDots: React.FC<{ box: number }> = ({ box }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.dots} accessibilityLabel={`Stage ${box + 1} of ${BOX_INTERVALS.length}`}>
      {BOX_INTERVALS.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i <= box
                ? theme.colors.primary
                : theme.colors.outlineVariant,
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function LearnScreen() {
  const theme = useAppTheme();
  const type = useType();
  const learning = useSettingsStore((s) => s.learning);
  const scrollRef = useRef<ScrollView>(null);
  const [tab, setTab] = useState<'heart' | 'quiz'>('heart');
  const [session, setSession] = useState<{ queue: number[]; mode: MemorizeMode } | null>(null);

  const todayKey = toLocalDateKey(new Date());
  const summary = learningSummary(learning, todayKey);
  const due = useMemo(() => dueKurals(learning, todayKey), [learning, todayKey]);
  const daily = useMemo(() => getDailyKural(), []);
  const dailyLearning = !!learning[daily.number];

  const learningList = useMemo(
    () => Object.entries(learning)
      .sort(([, a], [, b]) => a.due.localeCompare(b.due))
      .map(([n, card]) => ({ kural: getKuralByNumber(Number(n)), card }))
      .filter((x): x is { kural: Kural; card: typeof x.card } => !!x.kural),
    [learning]
  );
  const nextDue = learningList[0]?.card.due;

  const startLearn = (n: number) => setSession({ queue: [n], mode: 'learn' });

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
        <ScreenHeader eyebrow="கற்க கசடற" title="Learn" subtitle="Learn the Kural by heart, a couplet at a time" />

        <SegmentedButtons
          value={tab}
          onValueChange={(v) => setTab(v as 'heart' | 'quiz')}
          style={styles.tabs}
          buttons={[
            { value: 'heart', label: 'By heart', icon: 'head-heart-outline' },
            { value: 'quiz', label: 'Quiz', icon: 'lightbulb-on-outline' },
          ]}
        />

        {tab === 'quiz' ? (
          <QuizPanel scrollRef={scrollRef} />
        ) : (
          <View>
            {/* What to do now */}
            <View style={[styles.hero, { backgroundColor: theme.colors.primaryContainer }]}>
              {summary.due > 0 ? (
                <>
                  <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>Today&apos;s review</Text>
                  <Text style={[type.display(34), { color: theme.colors.onPrimaryContainer }]}>
                    {summary.due} {summary.due === 1 ? 'Kural' : 'Kurals'}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.85 }}>
                    Recite each from memory, then check. It takes about a minute each.
                  </Text>
                  <Button mode="contained" icon="play" style={styles.heroButton} onPress={() => setSession({ queue: due, mode: 'review' })}>
                    Start review
                  </Button>
                </>
              ) : summary.total === 0 ? (
                <>
                  <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>Start here</Text>
                  <Text style={[type.display(24), { color: theme.colors.onPrimaryContainer }]}>Learn your first Kural</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.85 }}>
                    Read it, then recite it with more and more words hidden. We bring it back at the right time so it stays with you.
                  </Text>
                  <Button mode="contained" icon="school-outline" style={styles.heroButton} onPress={() => startLearn(daily.number)}>
                    Learn today&apos;s Kural · {daily.number}
                  </Button>
                </>
              ) : (
                <>
                  <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>All caught up</Text>
                  <Text style={[type.display(24), { color: theme.colors.onPrimaryContainer }]}>
                    Next review: {nextDue ? formatDue(nextDue, todayKey).toLowerCase() : '—'}
                  </Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.85 }}>
                    {dailyLearning ? 'Practise any Kural below, or add a new one from Browse.' : 'A good time to add today’s Kural.'}
                  </Text>
                  {!dailyLearning && (
                    <Button mode="contained" icon="plus" style={styles.heroButton} onPress={() => startLearn(daily.number)}>
                      Learn today&apos;s Kural · {daily.number}
                    </Button>
                  )}
                </>
              )}
            </View>

            {summary.total > 0 && (
              <View style={styles.stats}>
                <Stats
                  items={[
                    { value: summary.total, label: 'Learning' },
                    { value: summary.mastered, label: 'By heart' },
                    { value: summary.due, label: 'Due today' },
                  ]}
                />
              </View>
            )}

            {learningList.length > 0 && (
              <>
                <SectionLabel>Your Kurals</SectionLabel>
                {learningList.map(({ kural, card }) => (
                  <KuralListItem
                    key={kural.number}
                    kural={kural}
                    showEnglish={false}
                    onPress={() => setSession({ queue: [kural.number], mode: card.due <= todayKey ? 'review' : 'practice' })}
                    right={
                      <View style={styles.cardMeta}>
                        <Text variant="labelSmall" style={{ color: card.due <= todayKey ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                          {formatDue(card.due, todayKey)}
                        </Text>
                        <BoxDots box={card.box} />
                      </View>
                    }
                  />
                ))}
              </>
            )}

            {/* How it works */}
            <SectionLabel>How it works</SectionLabel>
            {/* Numbered steps read more clearly than a column of icons */}
            <View style={styles.how}>
              {[
                'Read the couplet and listen to it slowly.',
                'Recite it as words disappear, until you can say it from memory.',
                'It returns after 1, 2, 4, 7, 15, 30 and 60 days. Forget it, and it starts again.',
                'Once you remember it after a 15-day gap, it counts as known by heart.',
              ].map((text, i) => (
                <View key={text} style={styles.howRow}>
                  <Text variant="labelLarge" style={[styles.howNumber, { color: theme.colors.primary }]}>{i + 1}</Text>
                  <Text variant="bodyMedium" style={[styles.howText, { color: theme.colors.onSurface }]}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <MemorizeSheet queue={session?.queue ?? null} mode={session?.mode ?? 'learn'} onClose={() => setSession(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: space.xxxl,
  },
  tabs: {
    marginHorizontal: space.lg,
    marginBottom: space.lg,
  },
  hero: {
    marginHorizontal: space.lg,
    padding: space.xl,
    borderRadius: radius.xl,
    gap: space.xs,
  },
  heroButton: {
    alignSelf: 'flex-start',
    marginTop: space.md,
  },
  stats: {
    paddingHorizontal: space.xl,
    marginTop: space.lg,
  },
  cardMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  dots: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  how: {
    marginHorizontal: space.xl,
    gap: space.md,
  },
  howNumber: {
    width: 16,
    fontVariant: ['tabular-nums'],
  },
  howRow: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
  },
  howText: {
    flex: 1,
    lineHeight: 21,
  },
});
