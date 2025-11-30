import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Share } from 'react-native';
import { Card, Text, Button, IconButton, Divider, useTheme } from 'react-native-paper';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Kural } from '../types/kural';
import { useSettingsStore } from '../store/useSettingsStore';
import { ShareModal } from './ShareModal';

interface KuralCardProps {
  kural: Kural;
}

export const KuralCard: React.FC<KuralCardProps> = ({ kural }) => {
  const theme = useTheme();
  const {
    showEnglish, showTamil, favorites, toggleFavorite, addToHistory,
    shareIncludeTamil, shareIncludeEnglish, shareIncludeExplanation,
    fontSize, selectedVoiceIdentifier
  } = useSettingsStore();
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const isFavorite = favorites.includes(kural.number);

  // Reset explanation state when kural changes
  useEffect(() => {
    setShowExplanation(false);
    addToHistory(kural.number);
  }, [kural.number]);

  const handleSpeak = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const thingToSay = `${kural.line1} ... ${kural.line2}`;
    
    // Speak Tamil text
    Speech.speak(thingToSay, {
      language: 'ta-IN',
      voice: selectedVoiceIdentifier || undefined,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleCopy = async () => {
    let message = `Thirukkural #${kural.number}\n\n${kural.line1}\n${kural.line2}`;
    if (showEnglish) message += `\n\nMeaning:\n${kural.eng}`;
    
    // Always include explanations in copy if they are available in data,
    // regardless of 'showExplanation' state, as copy is usually for external use.
    // Or we can respect the 'showExplanation' state. Let's include them for utility.
    message += `\n\nTamil Explanation:\n${kural.tam_exp}`;
    message += `\n\nEnglish Explanation:\n${kural.eng_exp}`;

    await Clipboard.setStringAsync(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async (forceText = false) => {
    let message = `Thirukkural #${kural.number}`;
    if (shareIncludeTamil) message += `\n\n${kural.line1}\n${kural.line2}`;
    if (shareIncludeEnglish) message += `\n\nMeaning:\n${kural.eng}`;
    if (shareIncludeExplanation) {
      if (shareIncludeTamil) message += `\n\nTamil Explanation:\n${kural.tam_exp}`;
      if (shareIncludeEnglish) message += `\n\nEnglish Explanation:\n${kural.eng_exp}`;
    }

    if (!forceText) {
      setShowShareModal(true);
    } else {
      // Share as text
      await Share.share({ message });
    }
  };

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(kural.number);
  };

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()}>
      <ShareModal
        visible={showShareModal}
        onDismiss={() => setShowShareModal(false)}
        kural={kural}
      />

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text variant="labelMedium" style={{ color: theme.colors.secondary }}>
              Kural {kural.number}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.colors.secondary }}>
              {kural.chap_tam} | {kural.sect_tam}
            </Text>
          </View>

          {showTamil && (
            <View style={styles.kuralContainer}>
              <Text variant="headlineSmall" style={[styles.tamilText, { fontSize: fontSize, lineHeight: fontSize * 1.5 }]}>
                {kural.line1}
              </Text>
              <Text variant="headlineSmall" style={[styles.tamilText, { fontSize: fontSize, lineHeight: fontSize * 1.5 }]}>
                {kural.line2}
              </Text>
            </View>
          )}

          {showTamil && showEnglish && <Divider style={styles.divider} />}

          {showEnglish && (
            <Text variant="bodyLarge" style={styles.englishText}>
              {kural.eng}
            </Text>
          )}

          {showExplanation && (
            <Animated.View
              style={styles.explanationContainer}
              entering={FadeInDown.duration(300)}
            >
              {showTamil && (
                <>
                  <Text variant="titleSmall" style={styles.sectionTitle}>Tamil Explanation (Mu. Va):</Text>
                  <Text variant="bodyMedium" style={styles.explanationText}>{kural.tam_exp}</Text>
                </>
              )}
              
              {showTamil && showEnglish && <View style={{ height: 12 }} />}

              {showEnglish && (
                <>
                  <Text variant="titleSmall" style={styles.sectionTitle}>English Explanation:</Text>
                  <Text variant="bodyMedium" style={styles.explanationText}>{kural.eng_exp}</Text>
                </>
              )}
            </Animated.View>
          )}
        </Card.Content>
      </Card>

      <Card.Actions style={styles.actions}>
        <IconButton
          icon={isFavorite ? "heart" : "heart-outline"}
          iconColor={isFavorite ? theme.colors.error : undefined}
          onPress={handleFavoritePress}
          mode="contained-tonal"
        />
        <IconButton
          icon={isSpeaking ? "stop" : "volume-high"}
          onPress={handleSpeak}
          mode="contained-tonal"
        />
        <IconButton
          icon="share-variant"
          onPress={() => handleShare(false)}
          onLongPress={() => handleShare(true)}
          delayLongPress={500}
          mode="contained-tonal"
        />
        <IconButton
          icon={copied ? "check" : "content-copy"}
          onPress={handleCopy}
          mode="contained-tonal"
        />
        <Button
          mode="text"
          onPress={() => setShowExplanation(!showExplanation)}
        >
          {showExplanation ? "Hide Meaning" : "Show Meaning"}
        </Button>
      </Card.Actions>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kuralContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  tamilText: {
    textAlign: 'center',
    fontFamily: 'NotoSansTamil_700Bold',
    marginBottom: 8,
  },
  englishText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 16,
    color: '#555',
    lineHeight: 24,
  },
  divider: {
    marginVertical: 12,
  },
  explanationContainer: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  explanationText: {
    lineHeight: 20,
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});