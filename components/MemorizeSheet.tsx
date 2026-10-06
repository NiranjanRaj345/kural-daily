import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Platform, TextStyle } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getKuralByNumber } from '../services/DataService';
import { useSettingsStore } from '../store/useSettingsStore';
import { SheetModal } from './SheetModal';
import { hasTamilVoice, speakKural, stopSpeaking } from '../services/SpeechService';
import { showNoTamilVoiceAlert } from './voiceHelp';
import { useAppTheme, space, radius, useType } from '../theme';

/** learn: first time (joins the review list) · review: due today (graded) · practice: ungraded run-through */
export type MemorizeMode = 'learn' | 'review' | 'practice';

interface MemorizeSheetProps {
  /** Kural numbers to go through, in order. Empty or null closes the sheet. */
  queue: number[] | null;
  mode: MemorizeMode;
  onClose: () => void;
}

/*
 * Learning by heart the way it is taught: read the couplet, then recite it
 * with more and more of it hidden. Steps:
 *   0 Read      – every word visible
 *   1 Gaps      – every other word hidden
 *   2 Cues      – only the first word of each line
 *   3 Recall    – nothing visible; recite, then check
 */
const STEPS = [
  { title: 'Read it', hint: 'Read the couplet aloud two or three times.' },
  { title: 'Fill the gaps', hint: 'Say the hidden words. Tap one to peek.' },
  { title: 'First words only', hint: 'Recite each line from its first word.' },
  { title: 'From memory', hint: 'Recite the whole Kural, then check yourself.' },
];
const RECALL = STEPS.length - 1;

/*
 * A hidden word drawn out of focus, under frosted glass. Native blur isn't dependable on Android
 * (a text shadow there comes out sharp, clipped to a box), so the blur is
 * built by hand: faint copies of the word spread around its place, never one
 * at the centre. The copies smear into the word's rough shape, which can't be
 * read, and it looks the same on every platform.
 */
const BLUR_RINGS = [
  { radius: 3, opacity: 0.09 },
  { radius: 5.5, opacity: 0.07 },
  { radius: 8, opacity: 0.05 },
];
const BLUR_COPIES = BLUR_RINGS.flatMap(({ radius: r, opacity }, ring) =>
  Array.from({ length: 10 }, (_, i) => {
    const angle = ((i + ring / BLUR_RINGS.length) / 10) * Math.PI * 2;
    return { x: Math.round(Math.cos(angle) * r * 10) / 10, y: Math.round(Math.sin(angle) * r * 10) / 10, opacity };
  })
);

const withAlpha = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

/** A hidden word: the smudged word under a frosted-glass box. Tapping it reveals the word. */
const BlurredWord: React.FC<{ word: string; style: TextStyle; ink: string; glass: string; edge: string }> = ({
  word, style, ink, glass, edge,
}) => (
  <View style={[styles.tile, { borderColor: edge }]}>
    {/* Keeps the word's size; never drawn */}
    <Text style={[style, { opacity: 0 }]}>{word}</Text>
    {BLUR_COPIES.map((o, i) => (
      <Text
        key={i}
        style={[style, styles.blurCopy, { color: ink, left: o.x, top: o.y, opacity: o.opacity }]}
        importantForAccessibility="no"
        accessibilityElementsHidden
      >
        {word}
      </Text>
    ))}
    <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(glass, 0.5) }]} />
  </View>
);

const isHidden = (step: number, wordIndex: number, globalIndex: number) => {
  if (step === 0) return false;
  if (step === 1) return globalIndex % 2 === 1;
  if (step === 2) return wordIndex !== 0;
  return true;
};

const haptic = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync();
};

export const MemorizeSheet: React.FC<MemorizeSheetProps> = ({ queue, mode, onClose }) => {
  const theme = useAppTheme();
  const type = useType();
  const reviewKural = useSettingsStore((s) => s.reviewKural);
  const startLearning = useSettingsStore((s) => s.startLearning);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const voice = useSettingsStore((s) => s.selectedVoiceIdentifier);
  const showEnglish = useSettingsStore((s) => s.showEnglish);

  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(mode === 'review' ? RECALL : 0);
  const [peeked, setPeeked] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [results, setResults] = useState({ remembered: 0, practice: 0 });
  const [done, setDone] = useState(false);
  const speaking = useRef(false);

  const visible = !!queue && queue.length > 0;
  const kural = visible ? getKuralByNumber(queue[index]) : undefined;

  // Start fresh whenever a new session opens
  useEffect(() => {
    if (!visible) return;
    setIndex(0);
    setResults({ remembered: 0, practice: 0 });
    setDone(false);
  }, [queue, visible]);

  // Reset per-Kural state
  useEffect(() => {
    setStep(mode === 'review' ? RECALL : 0);
    setPeeked(new Set());
    setChecked(false);
    setShowMeaning(false);
  }, [index, queue, mode]);

  useEffect(() => () => {
    if (speaking.current) stopSpeaking();
  }, []);

  const lines = useMemo(
    () => (kural ? [kural.line1, kural.line2].map((l) => l.trim().split(/\s+/)) : []),
    [kural]
  );

  const close = () => {
    if (speaking.current) stopSpeaking();
    onClose();
  };

  const listen = async () => {
    if (!kural) return;
    if (!(await hasTamilVoice())) {
      showNoTamilVoiceAlert();
      return;
    }
    speaking.current = true;
    // Slower than the reading speed: easier to repeat after
    speakKural(kural, { voice, rate: Math.max(0.5, speechRate - 0.15), onEnd: () => { speaking.current = false; } });
  };

  const grade = (remembered: boolean) => {
    if (!kural) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(remembered ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
    }
    const alreadyLearning = !!useSettingsStore.getState().learning[kural.number];
    if (mode === 'learn' && !alreadyLearning) {
      // First time through: it joins the review list, due tomorrow
      startLearning(kural.number);
    } else {
      reviewKural(kural.number, remembered);
    }
    setResults((r) => ({
      remembered: r.remembered + (remembered ? 1 : 0),
      practice: r.practice + (remembered ? 0 : 1),
    }));
    if (queue && index < queue.length - 1) {
      setIndex(index + 1);
    } else {
      setDone(true);
    }
  };

  if (!visible) return null;

  const total = queue!.length;
  const title = done ? (mode === 'review' ? 'Review complete' : 'Well done') : `Kural ${kural?.number ?? ''}`;
  const subtitle = done
    ? undefined
    : mode === 'review'
      ? `${index + 1} of ${total} to review`
      : `Step ${step + 1} of ${STEPS.length} · ${STEPS[step].title}`;

  let globalIndex = -1;

  const footer = done ? (
    <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
      <Button mode="contained" onPress={close} style={styles.wide} contentStyle={styles.buttonContent}>Done</Button>
    </View>
  ) : step < RECALL ? (
    <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
      <Button mode="text" icon="chevron-left" disabled={step === 0} onPress={() => { haptic(); setStep(step - 1); setPeeked(new Set()); }}>
        Back
      </Button>
      <Button
        mode="contained"
        icon="chevron-right"
        contentStyle={[styles.buttonContent, { flexDirection: 'row-reverse' }]}
        onPress={() => { haptic(); setStep(step + 1); setPeeked(new Set()); }}
      >
        {step === RECALL - 1 ? 'Recite from memory' : 'Next step'}
      </Button>
    </View>
  ) : mode === 'practice' && checked ? (
    <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
      <Button mode="text" onPress={() => { setStep(0); setChecked(false); setPeeked(new Set()); }}>Again</Button>
      <Button mode="contained" onPress={close} contentStyle={styles.buttonContent}>Done</Button>
    </View>
  ) : !checked ? (
    <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
      <Button mode="contained" icon="eye-outline" onPress={() => { haptic(); setChecked(true); }} style={styles.wide} contentStyle={styles.buttonContent}>
        Check my recall
      </Button>
    </View>
  ) : (
    <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
      <Button mode="outlined" onPress={() => grade(false)} style={styles.half} contentStyle={styles.buttonContent}>
        Needs practice
      </Button>
      <Button mode="contained" onPress={() => grade(true)} style={styles.half} contentStyle={styles.buttonContent}>
        I knew it
      </Button>
    </View>
  );

  return (
    <SheetModal
      visible={visible}
      onClose={close}
      title={title}
      subtitle={subtitle}
      footer={footer}
      contentKey={`${index}-${done}`}
    >
      {done ? (
        <Animated.View entering={FadeIn} style={styles.done}>
          <View style={[styles.doneIcon, { backgroundColor: theme.colors.successContainer }]}>
            <MaterialCommunityIcons name="check-decagram" size={40} color={theme.colors.onSuccessContainer} />
          </View>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
            {mode === 'review'
              ? `${results.remembered} of ${results.remembered + results.practice} remembered`
              : results.remembered > 0 ? 'Committed to memory' : 'Keep practising'}
          </Text>
          <Text variant="bodyMedium" style={[styles.doneText, { color: theme.colors.onSurfaceVariant }]}>
            {mode === 'review'
              ? 'Kurals you knew come back after a longer gap. The ones that need practice return tomorrow.'
              : 'It is now in your review list and will come back tomorrow, then at growing intervals until you know it by heart.'}
          </Text>
        </Animated.View>
      ) : kural ? (
        <Animated.View key={`${kural.number}-${step}`} entering={FadeIn.duration(200)} style={styles.body}>
          <View style={styles.progress}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  { backgroundColor: i <= step ? theme.colors.primary : theme.colors.outlineVariant },
                ]}
              />
            ))}
          </View>

          <Text variant="bodyMedium" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            {checked ? 'Compare with what you recited.' : STEPS[step].hint}
          </Text>

          <View style={[styles.verseBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            {lines.map((words, li) => (
              <View key={li} style={styles.line}>
                {words.map((word, wi) => {
                  globalIndex += 1;
                  const gi = globalIndex;
                  const hidden = !checked && isHidden(step, wi, gi) && !peeked.has(gi);
                  return (
                    <Pressable
                      key={wi}
                      disabled={!hidden}
                      onPress={() => { haptic(); setPeeked((p) => new Set(p).add(gi)); }}
                      accessibilityRole={hidden ? 'button' : 'text'}
                      accessibilityLabel={hidden ? `Hidden word ${gi + 1}, tap to reveal` : word}
                      style={styles.word}
                    >
                      {hidden ? (
                        <BlurredWord
                          word={word}
                          style={type.kural(20)}
                          ink={theme.colors.ink}
                          glass={theme.colors.surfaceVariant}
                          edge={theme.colors.outlineVariant}
                        />
                      ) : (
                        // A peeked word fades in from behind its glass
                        <Animated.Text
                          entering={peeked.has(gi) ? FadeIn.duration(250) : undefined}
                          style={[type.kural(20), { color: theme.colors.ink }]}
                        >
                          {word}
                        </Animated.Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.tools}>
            <Button compact icon="volume-high" onPress={listen}>Listen slowly</Button>
            {showEnglish && (
              <Button compact icon={showMeaning ? 'eye-off-outline' : 'lightbulb-outline'} onPress={() => setShowMeaning((v) => !v)}>
                {showMeaning ? 'Hide meaning' : 'Meaning'}
              </Button>
            )}
          </View>

          {(showMeaning || (step === 0 && showEnglish)) && (
            <Text style={[type.translation, styles.meaning, { color: theme.colors.onSurfaceVariant }]}>
              {kural.eng}
            </Text>
          )}

          <Text style={[type.tamilLabel, styles.source, { color: theme.colors.onSurfaceVariant }]}>
            {kural.chap_tam} · {kural.sect_tam}
          </Text>
        </Animated.View>
      ) : null}
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: space.xl,
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: space.md,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  hint: {
    marginBottom: space.lg,
  },
  verseBox: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.lg,
    gap: space.sm,
  },
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  word: {
    paddingHorizontal: 4,
  },
  blurCopy: {
    position: 'absolute',
  },
  // The blur stays inside its tile
  tile: {
    overflow: 'hidden',
    marginHorizontal: -4,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tools: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: space.md,
    marginLeft: -space.sm,
  },
  meaning: {
    marginTop: space.sm,
  },
  source: {
    marginTop: space.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  wide: {
    flex: 1,
  },
  half: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  done: {
    alignItems: 'center',
    paddingHorizontal: space.xxl,
    paddingTop: space.xxl,
    gap: space.md,
  },
  doneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
