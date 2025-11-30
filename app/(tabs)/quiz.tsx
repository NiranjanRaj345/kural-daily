import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, useTheme, Surface, IconButton, Chip, Portal, Dialog, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  generateMissingWordQuestion,
  generateMeaningMatchQuestion,
  generateFindChapterQuestion,
  generateJumbledKuralQuestion,
  QuizQuestion,
  QuizType
} from '../../services/QuizService';
import { useSettingsStore } from '../../store/useSettingsStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function QuizScreen() {
  const theme = useTheme();
  const { quizStats, updateQuizStats } = useSettingsStore();
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Game Mode State
  const [gameMode, setGameMode] = useState<QuizType>('missing-word');
  const [showModeSelector, setShowModeSelector] = useState(false);

  // Jumbled Kural State
  const [jumbledSelection, setJumbledSelection] = useState<number[]>([]); // Store indices of selected words

  const loadNewQuestion = useCallback(() => {
    let newQuestion: QuizQuestion;
    switch (gameMode) {
      case 'meaning-match':
        newQuestion = generateMeaningMatchQuestion();
        break;
      case 'find-chapter':
        newQuestion = generateFindChapterQuestion();
        break;
      case 'jumbled-kural':
        newQuestion = generateJumbledKuralQuestion();
        break;
      case 'missing-word':
      default:
        newQuestion = generateMissingWordQuestion();
        break;
    }
    setQuestion(newQuestion);
    setSelectedOption(null);
    setJumbledSelection([]);
    setIsAnswered(false);
    setIsCorrect(false);
  }, [gameMode]);

  useEffect(() => {
    loadNewQuestion();
  }, [loadNewQuestion]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered || !question) return;

    setSelectedOption(index);
    const correct = index === question.correctAnswerIndex;
    setIsCorrect(correct);
    setIsAnswered(true);
    updateQuizStats(correct);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleJumbledWordSelect = (index: number) => {
    if (isAnswered) return;
    setJumbledSelection(prev => [...prev, index]);
  };

  const handleJumbledReset = () => {
    if (isAnswered) return;
    setJumbledSelection([]);
  };

  const checkJumbledAnswer = () => {
    if (!question || !question.kural || !question.jumbledWords) return;
    
    const correctLine1 = question.kural.line1.split(/\s+/).filter(w => w.length > 0).join(' ');
    const correctLine2 = question.kural.line2.split(/\s+/).filter(w => w.length > 0).join(' ');
    const correctFull = `${correctLine1} ${correctLine2}`;
    
    const userFull = jumbledSelection.map(idx => question.jumbledWords![idx]).join(' ');
    
    // Simple check: remove spaces and compare to handle minor spacing diffs
    const isMatch = userFull.replace(/\s+/g, '') === correctFull.replace(/\s+/g, '');
    
    setIsCorrect(isMatch);
    setIsAnswered(true);
    updateQuizStats(isMatch);

    if (isMatch) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const getModeTitle = (mode: QuizType) => {
    switch(mode) {
      case 'missing-word': return 'Missing Word';
      case 'meaning-match': return 'Meaning Match';
      case 'find-chapter': return 'Find Chapter';
      case 'jumbled-kural': return 'Jumbled Kural';
      default: return 'Quiz';
    }
  };

  const getInstruction = (mode: QuizType) => {
    switch(mode) {
      case 'missing-word': return 'Fill in the missing word to complete the Kural.';
      case 'meaning-match': return 'Select the correct meaning for the Kural.';
      case 'find-chapter': return 'Identify the chapter this Kural belongs to.';
      case 'jumbled-kural': return 'Tap words in the correct order to form the Kural.';
      default: return '';
    }
  };

  if (!question) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Stats */}
        <Surface style={[styles.statsContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
          <View style={styles.statItem}>
            <Text variant="labelMedium">Streak</Text>
            <View style={styles.statValueContainer}>
              <MaterialCommunityIcons name="fire" size={20} color={theme.colors.error} />
              <Text variant="titleMedium" style={{ color: theme.colors.error }}>{quizStats.currentStreak}</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text variant="labelMedium">Total</Text>
            <Text variant="titleMedium">{quizStats.totalAnswered}</Text>
          </View>
          <View style={styles.statItem}>
            <Text variant="labelMedium">Accuracy</Text>
            <Text variant="titleMedium">
              {quizStats.totalAnswered > 0 
                ? Math.round((quizStats.correctAnswers / quizStats.totalAnswered) * 100) 
                : 0}%
            </Text>
          </View>
        </Surface>

        {/* Mode Selector Button */}
        <View style={styles.modeHeader}>
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            {getModeTitle(gameMode)}
          </Text>
          <IconButton 
            icon="tune" 
            mode="contained-tonal" 
            onPress={() => setShowModeSelector(true)} 
          />
        </View>
        
        <Text variant="bodyLarge" style={styles.instruction}>
          {getInstruction(gameMode)}
        </Text>

        {/* Question Card */}
        <Card style={styles.questionCard}>
          <Card.Content>
            {gameMode === 'jumbled-kural' ? (
               <View style={styles.jumbledDisplay}>
                 <Text variant="titleLarge" style={[styles.kuralText, { textAlign: 'center', lineHeight: 32, minHeight: 64 }]}>
                   {jumbledSelection.length > 0
                     ? jumbledSelection.map(idx => question.jumbledWords![idx]).join(' ')
                     : 'Tap words below...'}
                 </Text>
                 {!isAnswered && jumbledSelection.length > 0 && (
                   <Button onPress={handleJumbledReset} compact>Clear</Button>
                 )}
               </View>
            ) : (
              <Text variant="titleLarge" style={[styles.kuralText, { textAlign: 'center', lineHeight: 32 }]}>
                {question.questionText}
              </Text>
            )}
            
            {gameMode !== 'find-chapter' && (
               <Text variant="labelMedium" style={{ textAlign: 'center', marginTop: 8, opacity: 0.6 }}>
                 Kural {question.kural.number}
               </Text>
            )}
          </Card.Content>
        </Card>

        {/* Options Area */}
        <View style={styles.optionsContainer}>
          {gameMode === 'jumbled-kural' ? (
            <View style={styles.jumbledWordsContainer}>
              {question.jumbledWords?.map((word, index) => {
                const isSelected = jumbledSelection.includes(index);
                
                return (
                  <Chip
                    key={index}
                    mode="outlined"
                    style={{ margin: 4, opacity: isSelected ? 0.3 : 1 }}
                    onPress={() => handleJumbledWordSelect(index)}
                    disabled={isSelected || isAnswered}
                  >
                    {word}
                  </Chip>
                );
              })}
              {!isAnswered && (
                 <Button
                   mode="contained"
                   onPress={checkJumbledAnswer}
                   style={{ marginTop: 16, width: '100%' }}
                   disabled={jumbledSelection.length === 0}
                 >
                   Check Answer
                 </Button>
              )}
            </View>
          ) : (
            question.options.map((option, index) => {
              let buttonColor = theme.colors.surface;
              let textColor = theme.colors.onSurface;
              let borderColor = theme.colors.outline;

              if (isAnswered) {
                if (index === question.correctAnswerIndex) {
                  buttonColor = theme.colors.primaryContainer;
                  borderColor = theme.colors.primary;
                } else if (index === selectedOption) {
                  buttonColor = theme.colors.errorContainer;
                  borderColor = theme.colors.error;
                }
              } else if (index === selectedOption) {
                 buttonColor = theme.colors.secondaryContainer;
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: buttonColor,
                      borderColor: borderColor,
                      borderWidth: 1
                    }
                  ]}
                  onPress={() => handleOptionSelect(index)}
                  disabled={isAnswered}
                >
                  <Text variant="bodyLarge" style={{ color: textColor, textAlign: 'center' }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Feedback & Next Button */}
        {isAnswered && (
          <View style={styles.feedbackContainer}>
            <View style={[styles.feedbackMessage, { backgroundColor: isCorrect ? theme.colors.primaryContainer : theme.colors.errorContainer }]}>
               <MaterialCommunityIcons 
                  name={isCorrect ? "check-circle" : "close-circle"} 
                  size={24} 
                  color={isCorrect ? theme.colors.primary : theme.colors.error} 
               />
               <Text variant="titleMedium" style={{ marginLeft: 8, color: isCorrect ? theme.colors.onPrimaryContainer : theme.colors.onErrorContainer }}>
                 {isCorrect ? "Correct! Well done." : "Incorrect. Try the next one!"}
               </Text>
            </View>
            
            <View style={styles.explanationContainer}>
               {gameMode === 'jumbled-kural' && (
                 <View style={{marginBottom: 8}}>
                    <Text variant="labelLarge">Correct Order:</Text>
                    <Text variant="bodyMedium" style={{fontWeight: 'bold'}}>{question.kural.line1} {question.kural.line2}</Text>
                 </View>
               )}
               <Text variant="labelLarge" style={{marginBottom: 4}}>Meaning:</Text>
               <Text variant="bodyMedium">{question.kural.tam_exp}</Text>
               {gameMode === 'find-chapter' && (
                  <Text variant="bodySmall" style={{marginTop: 8, opacity: 0.7}}>Chapter: {question.kural.chap_tam}</Text>
               )}
            </View>

            <Button 
              mode="contained" 
              onPress={loadNewQuestion} 
              style={styles.nextButton}
              icon="arrow-right"
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              Next Question
            </Button>
          </View>
        )}

      </ScrollView>

      {/* Mode Selector Dialog */}
      <Portal>
        <Dialog visible={showModeSelector} onDismiss={() => setShowModeSelector(false)}>
          <Dialog.Title>Select Game Mode</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={value => {
              setGameMode(value as QuizType);
              setShowModeSelector(false);
            }} value={gameMode}>
              <RadioButton.Item label="Missing Word" value="missing-word" />
              <RadioButton.Item label="Meaning Match" value="meaning-match" />
              <RadioButton.Item label="Find Chapter" value="find-chapter" />
              <RadioButton.Item label="Jumbled Kural" value="jumbled-kural" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowModeSelector(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  title: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  questionCard: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  kuralText: {
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    elevation: 1,
    minHeight: 60,
    justifyContent: 'center',
  },
  feedbackContainer: {
    gap: 16,
  },
  feedbackMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  explanationContainer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  nextButton: {
    marginTop: 8,
  },
  jumbledDisplay: {
    alignItems: 'center',
  },
  jumbledWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  }
});