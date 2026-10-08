import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Platform } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  generateMissingWordQuestion,
  generateMeaningMatchQuestion,
  generateFindChapterQuestion,
  generateJumbledKuralQuestion,
  QuizQuestion,
  QuizType,
} from '../services/QuizService';
import { useSettingsStore } from '../store/useSettingsStore';
import { Stats } from './ui/Stats';
import { useAppTheme, space, radius, useType } from '../theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const MODES: { type: QuizType; label: string; icon: IconName; instruction: string }[] = [
  { type: 'missing-word', label: 'Missing word', icon: 'form-textbox', instruction: 'Choose the word that completes the Kural.' },
  { type: 'meaning-match', label: 'Meaning', icon: 'text-box-check-outline', instruction: 'Which explanation matches this Kural?' },
  { type: 'find-chapter', label: 'Chapter', icon: 'book-search-outline', instruction: 'Which chapter is this Kural from?' },
  { type: 'jumbled-kural', label: 'Jumbled', icon: 'swap-horizontal', instruction: 'Tap the words in the right order.' },
];

const GENERATORS: Record<QuizType, () => QuizQuestion> = {
  'missing-word': generateMissingWordQuestion,
  'meaning-match': generateMeaningMatchQuestion,
  'find-chapter': generateFindChapterQuestion,
  'jumbled-kural': generateJumbledKuralQuestion,
};

const LETTERS = ['A', 'B', 'C', 'D'];

const feedback = (correct: boolean) => {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
};

interface QuizPanelProps {
  /** The screen's scroll view, used to bring the result into view. */
  scrollRef: React.RefObject<ScrollView | null>;
}

export const QuizPanel: React.FC<QuizPanelProps> = ({ scrollRef }) => {
  const theme = useAppTheme();
  const type = useType();
  const quizStats = useSettingsStore((s) => s.quizStats);
  const updateQuizStats = useSettingsStore((s) => s.updateQuizStats);
  const [gameMode, setGameMode] = useState<QuizType>('missing-word');
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [jumbledSelection, setJumbledSelection] = useState<number[]>([]);

  const loadNewQuestion = useCallback(() => {
    setQuestion(GENERATORS[gameMode]());
    setSelectedOption(null);
    setJumbledSelection([]);
    setIsAnswered(false);
    setIsCorrect(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [gameMode, scrollRef]);

  useEffect(() => {
    loadNewQuestion();
  }, [loadNewQuestion]);

  const answer = (correct: boolean) => {
    setIsCorrect(correct);
    setIsAnswered(true);
    updateQuizStats(correct);
    feedback(correct);
    // Bring the result and the Next button into view
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswered || !question) return;
    setSelectedOption(index);
    answer(index === question.correctAnswerIndex);
  };

  const checkJumbledAnswer = () => {
    if (!question?.jumbledWords) return;
    const correct = `${question.kural.line1} ${question.kural.line2}`.replace(/\s+/g, '');
    const attempt = jumbledSelection.map((i) => question.jumbledWords![i]).join('').replace(/\s+/g, '');
    answer(attempt === correct);
  };

  const mode = MODES.find((m) => m.type === gameMode)!;
  const accuracy = quizStats.totalAnswered > 0
    ? Math.round((quizStats.correctAnswers / quizStats.totalAnswered) * 100)
    : 0;

  // Meaning options are whole explanations, so they use the smaller body size
  const optionTextStyle = gameMode === 'meaning-match' ? type.tamilLabel : type.tamilTitle;

  return (
    <View>

      <View style={styles.stats}>
        <Stats
          items={[
            { value: quizStats.currentStreak, label: 'In a row' },
            { value: quizStats.totalAnswered, label: 'Answered' },
            { value: `${accuracy}%`, label: 'Right' },
          ]}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modes}>
        {MODES.map((m) => (
          <Chip
            key={m.type}
            icon={m.icon}
            mode="outlined"
            selected={gameMode === m.type}
            style={gameMode === m.type ? { backgroundColor: theme.colors.secondaryContainer } : undefined}
            onPress={() => setGameMode(m.type)}
            accessibilityLabel={`${m.label} mode`}
          >
            {m.label}
          </Chip>
        ))}
      </ScrollView>

      {question && (
        <Animated.View key={question.id} entering={FadeInDown.duration(300)}>
          <Text variant="titleMedium" style={[styles.instruction, { color: theme.colors.onSurface }]}>
            {mode.instruction}
          </Text>

          {/* Question */}
          <View style={[styles.questionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
            {gameMode === 'jumbled-kural' ? (
              <View style={styles.jumbledAnswer}>
                {jumbledSelection.length === 0 ? (
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Your answer appears here
                  </Text>
                ) : (
                  jumbledSelection.map((wordIndex, position) => (
                    <Chip
                      key={`${wordIndex}-${position}`}
                      compact
                      disabled={isAnswered}
                      onPress={() => setJumbledSelection((sel) => sel.filter((_, i) => i !== position))}
                      style={{ backgroundColor: theme.colors.primaryContainer }}
                      textStyle={[type.tamilLabel, { color: theme.colors.onPrimaryContainer }]}
                      accessibilityLabel={`Remove ${question.jumbledWords![wordIndex]}`}
                    >
                      {question.jumbledWords![wordIndex]}
                    </Chip>
                  ))
                )}
              </View>
            ) : (
              <Text style={[type.kural(19), styles.questionText, { color: theme.colors.onSurface }]}>
                {question.questionText}
              </Text>
            )}
            {gameMode !== 'find-chapter' && (
              <Text variant="labelSmall" style={[styles.questionMeta, { color: theme.colors.onSurfaceVariant }]}>
                Kural {question.kural.number}
              </Text>
            )}
          </View>

          {/* Answers */}
          {gameMode === 'jumbled-kural' ? (
            <View>
              <View style={styles.wordBank}>
                {question.jumbledWords?.map((word, index) => {
                  const used = jumbledSelection.includes(index);
                  return (
                    <Chip
                      key={index}
                      mode="outlined"
                      disabled={used || isAnswered}
                      onPress={() => setJumbledSelection((sel) => [...sel, index])}
                      style={{ opacity: used ? 0.35 : 1 }}
                      textStyle={type.tamilLabel}
                    >
                      {word}
                    </Chip>
                  );
                })}
              </View>
              {!isAnswered && (
                <Button
                  mode="contained"
                  onPress={checkJumbledAnswer}
                  disabled={jumbledSelection.length !== (question.jumbledWords?.length ?? 0)}
                  style={styles.primaryButton}
                  contentStyle={styles.primaryButtonContent}
                >
                  Check answer
                </Button>
              )}
            </View>
          ) : (
            <View style={styles.options}>
              {question.options.map((option, index) => {
                const isRight = index === question.correctAnswerIndex;
                const isPicked = index === selectedOption;
                let bg = theme.colors.surface;
                let border = theme.colors.outlineVariant;
                let fg = theme.colors.onSurface;
                let icon: IconName | null = null;
                if (isAnswered && isRight) {
                  // Right answers in the accent, wrong ones a quiet grey (a red would clash with Kumkum)
                  bg = theme.colors.primaryContainer; border = theme.colors.primary; fg = theme.colors.onPrimaryContainer; icon = 'check-circle';
                } else if (isAnswered && isPicked) {
                  bg = theme.colors.surfaceVariant; border = theme.colors.outline; fg = theme.colors.onSurfaceVariant; icon = 'close-circle';
                }
                const dimmed = isAnswered && !isRight && !isPicked;
                return (
                  <Pressable
                    key={index}
                    onPress={() => handleOptionSelect(index)}
                    disabled={isAnswered}
                    accessibilityRole="button"
                    accessibilityLabel={`Option ${LETTERS[index]}: ${option}`}
                    accessibilityState={{ disabled: isAnswered, selected: isPicked }}
                    android_ripple={{ color: theme.colors.primaryContainer }}
                    style={({ pressed }) => [
                      styles.option,
                      { backgroundColor: bg, borderColor: border, opacity: dimmed ? 0.55 : pressed ? 0.8 : 1 },
                    ]}
                  >
                    <View style={[styles.letter, { borderColor: isAnswered && (isRight || isPicked) ? border : theme.colors.outline }]}>
                      <Text variant="labelMedium" style={{ color: fg }}>{LETTERS[index]}</Text>
                    </View>
                    <Text style={[optionTextStyle, styles.optionText, { color: fg }]}>{option}</Text>
                    {icon && <MaterialCommunityIcons name={icon} size={22} color={border} />}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Result */}
          {isAnswered && (
            <Animated.View entering={FadeIn.duration(250)} style={styles.result}>
              <View style={[styles.resultBanner, { backgroundColor: isCorrect ? theme.colors.primaryContainer : theme.colors.surfaceVariant }]}>
                <MaterialCommunityIcons
                  name={isCorrect ? 'party-popper' : 'lightbulb-outline'}
                  size={22}
                  color={isCorrect ? theme.colors.onPrimaryContainer : theme.colors.onSurface}
                />
                <Text variant="titleSmall" style={{ color: isCorrect ? theme.colors.onPrimaryContainer : theme.colors.onSurface, flex: 1 }}>
                  {isCorrect
                    ? quizStats.currentStreak > 2 ? `Correct! ${quizStats.currentStreak} in a row.` : 'Correct!'
                    : 'Not quite. Here is the Kural:'}
                </Text>
              </View>

              <View style={[styles.reveal, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
                <Text style={[type.tamilTitle, { color: theme.colors.onSurface, textAlign: 'center' }]}>
                  {question.kural.line1}{'\n'}{question.kural.line2}
                </Text>
                <Text variant="labelMedium" style={[styles.revealMeta, { color: theme.colors.primary }]}>
                  Kural {question.kural.number} · {question.kural.chap_tam}
                </Text>
                <Text style={[type.tamilBody, { color: theme.colors.onSurfaceVariant }]}>{question.kural.tam_exp}</Text>
              </View>

              <Button
                mode="contained"
                onPress={loadNewQuestion}
                icon="arrow-right"
                style={styles.primaryButton}
                contentStyle={[styles.primaryButtonContent, { flexDirection: 'row-reverse' }]}
              >
                Next question
              </Button>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stats: {
    paddingHorizontal: space.xl,
  },
  modes: {
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
  },
  instruction: {
    paddingHorizontal: space.xl,
    marginBottom: space.md,
  },
  questionCard: {
    marginHorizontal: space.lg,
    padding: space.xl,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 120,
    justifyContent: 'center',
  },
  questionText: {
    textAlign: 'center',
  },
  questionMeta: {
    textAlign: 'center',
    marginTop: space.md,
  },
  jumbledAnswer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 64,
    alignItems: 'center',
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  options: {
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  letter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  result: {
    paddingTop: space.lg,
    gap: space.md,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
  },
  reveal: {
    marginHorizontal: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  revealMeta: {
    textAlign: 'center',
    marginVertical: space.sm,
  },
  primaryButton: {
    marginHorizontal: space.lg,
    marginTop: space.lg,
    borderRadius: radius.pill,
  },
  primaryButtonContent: {
    paddingVertical: 6,
  },
});
