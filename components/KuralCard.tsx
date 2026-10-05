import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Kural } from '../types/kural';
import { useSettingsStore } from '../store/useSettingsStore';
import { getChapterNumber, getPositionInChapter } from '../services/DataService';
import { ShareModal } from './ShareModal';
import { KuralVerse } from './KuralVerse';
import { MemorizeSheet, MemorizeMode } from './MemorizeSheet';
import { useAppTheme, space, radius, tamilText, englishText } from '../theme';

interface KuralCardProps {
  kural: Kural;
  /** Open the explanation by default (e.g. on the Today screen). */
  defaultExpanded?: boolean;
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const haptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') Haptics.impactAsync(style);
};

const ActionButton: React.FC<{
  icon: IconName;
  label: string;
  onPress: () => void;
  active?: boolean;
  activeColor?: string;
  accessibilityLabel?: string;
}> = ({ icon, label, onPress, active, activeColor, accessibilityLabel }) => {
  const theme = useAppTheme();
  const color = active ? activeColor ?? theme.colors.primary : theme.colors.onSurfaceVariant;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: !!active }}
      android_ripple={{ color: theme.colors.primaryContainer, borderless: true, radius: 36 }}
      hitSlop={4}
      style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
    >
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text variant="labelSmall" style={{ color, marginTop: 4 }}>{label}</Text>
    </Pressable>
  );
};

export const KuralCard: React.FC<KuralCardProps> = ({ kural, defaultExpanded = false }) => {
  const theme = useAppTheme();
  const showEnglish = useSettingsStore((s) => s.showEnglish);
  const showTamil = useSettingsStore((s) => s.showTamil);
  const isFavorite = useSettingsStore((s) => s.favorites.includes(kural.number));
  const isLearning = useSettingsStore((s) => !!s.learning[kural.number]);
  const toggleFavorite = useSettingsStore((s) => s.toggleFavorite);
  const addToHistory = useSettingsStore((s) => s.addToHistory);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const selectedVoiceIdentifier = useSettingsStore((s) => s.selectedVoiceIdentifier);

  const [showExplanation, setShowExplanation] = useState(defaultExpanded);
  const [explanationLang, setExplanationLang] = useState<'ta' | 'en'>(showTamil ? 'ta' : 'en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [memorizing, setMemorizing] = useState<{ queue: number[]; mode: MemorizeMode } | null>(null);

  // Reset per-kural state and record the read
  useEffect(() => {
    setShowExplanation(defaultExpanded);
    addToHistory(kural.number);
  }, [kural.number, addToHistory, defaultExpanded]);

  // Keep the explanation language valid if a language is turned off in settings
  useEffect(() => {
    if (!showTamil && explanationLang === 'ta') setExplanationLang('en');
    if (!showEnglish && explanationLang === 'en') setExplanationLang('ta');
  }, [showTamil, showEnglish, explanationLang]);

  const updateSpeaking = (value: boolean) => {
    isSpeakingRef.current = value;
    setIsSpeaking(value);
  };

  // Don't keep reading aloud after the card is closed or replaced
  useEffect(() => {
    return () => {
      if (isSpeakingRef.current) {
        isSpeakingRef.current = false;
        Speech.stop();
      }
    };
  }, [kural.number]);

  const handleSpeak = () => {
    haptic();
    if (isSpeaking) {
      Speech.stop();
      updateSpeaking(false);
      return;
    }

    updateSpeaking(true);
    Speech.speak(`${kural.line1} ... ${kural.line2}`, {
      language: 'ta-IN',
      voice: selectedVoiceIdentifier || undefined,
      rate: speechRate,
      onDone: () => updateSpeaking(false),
      onStopped: () => updateSpeaking(false),
      onError: () => updateSpeaking(false),
    });
  };

  const handleFavoritePress = () => {
    haptic(isFavorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(kural.number);
  };

  const bothLanguages = showTamil && showEnglish;
  const explanation = explanationLang === 'ta' ? kural.tam_exp : kural.eng_exp;
  const chapterNumber = getChapterNumber(kural);
  const position = getPositionInChapter(kural);

  return (
    <Animated.View entering={FadeInDown.duration(350)}>
      <ShareModal visible={showShareModal} onDismiss={() => setShowShareModal(false)} kural={kural} />
      <MemorizeSheet queue={memorizing?.queue ?? null} mode={memorizing?.mode ?? 'learn'} onClose={() => setMemorizing(null)} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        {/* Folio: where this couplet sits in the book */}
        <View style={styles.folio}>
          <Text
            style={[styles.number, { color: theme.colors.primary }]}
            accessibilityLabel={`Kural ${kural.number}`}
          >
            {kural.number}
          </Text>
          <View style={styles.folioText}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              அதிகாரம் {chapterNumber} · {position}/10
            </Text>
            <Text style={[tamilText.labelStrong, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {kural.chap_tam}
            </Text>
            {kural.chap_eng && (
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
                {kural.chap_eng} · {kural.sect_eng}
              </Text>
            )}
          </View>
        </View>

        {/* The couplet */}
        {showTamil && (
          <View style={styles.verse}>
            <KuralVerse kural={kural} size={fontSize} />
          </View>
        )}

        {showEnglish && (
          <Text
            selectable
            style={[
              englishText.translation,
              styles.translation,
              { color: showTamil ? theme.colors.onSurfaceVariant : theme.colors.ink },
              !showTamil && styles.translationPrimary,
            ]}
          >
            {kural.eng}
          </Text>
        )}

        {/* Meaning */}
        <Pressable
          onPress={() => setShowExplanation((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: showExplanation }}
          style={[styles.explainToggle, { borderTopColor: theme.colors.rule }]}
        >
          <Text style={[tamilText.labelStrong, { color: theme.colors.primary }]}>பொருள்</Text>
          <Text variant="labelLarge" style={[styles.explainLabel, { color: theme.colors.primary }]}>
            Meaning
          </Text>
          <MaterialCommunityIcons
            name={showExplanation ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={theme.colors.primary}
          />
        </Pressable>

        {showExplanation && (
          <Animated.View entering={FadeIn.duration(250)} style={styles.explanation}>
            {bothLanguages && (
              <SegmentedButtons
                value={explanationLang}
                onValueChange={(v) => setExplanationLang(v as 'ta' | 'en')}
                density="small"
                style={styles.langSwitch}
                buttons={[
                  { value: 'ta', label: 'தமிழ்' },
                  { value: 'en', label: 'English' },
                ]}
              />
            )}
            <Text
              selectable
              style={[explanationLang === 'ta' ? tamilText.body : englishText.body, { color: theme.colors.onSurface }]}
            >
              {explanation}
            </Text>
            {explanationLang === 'ta' && (
              <Text variant="labelSmall" style={[styles.attribution, { color: theme.colors.onSurfaceVariant }]}>
                உரை: மு. வரதராசனார்
              </Text>
            )}
          </Animated.View>
        )}

        {/* Actions */}
        <View style={[styles.actions, { borderTopColor: theme.colors.rule }]}>
          <ActionButton
            icon={isFavorite ? 'bookmark' : 'bookmark-outline'}
            label={isFavorite ? 'Saved' : 'Save'}
            active={isFavorite}
            activeColor={theme.colors.flame}
            onPress={handleFavoritePress}
            accessibilityLabel={isFavorite ? 'Remove from saved' : 'Save Kural'}
          />
          <ActionButton
            icon={isSpeaking ? 'stop-circle-outline' : 'volume-high'}
            label={isSpeaking ? 'Stop' : 'Listen'}
            active={isSpeaking}
            onPress={handleSpeak}
            accessibilityLabel={isSpeaking ? 'Stop reading' : 'Read aloud'}
          />
          <ActionButton
            icon={isLearning ? 'school' : 'school-outline'}
            label={isLearning ? 'Learning' : 'Learn'}
            active={isLearning}
            onPress={() => {
              haptic();
              // Fixed when the sheet opens: grading a new Kural adds it to the review list,
              // which must not switch the open session into practice mode.
              // Already learning: practise without changing its review schedule.
              setMemorizing({ queue: [kural.number], mode: isLearning ? 'practice' : 'learn' });
            }}
            accessibilityLabel={isLearning ? 'Practise this Kural' : 'Learn this Kural by heart'}
          />
          <ActionButton icon="share-variant-outline" label="Share" onPress={() => setShowShareModal(true)} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: space.lg,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  folio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
  },
  number: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 34,
    lineHeight: 40,
    minWidth: 48,
    fontVariant: ['tabular-nums'],
  },
  folioText: {
    flex: 1,
  },
  verse: {
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
    paddingBottom: space.sm,
  },
  translation: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
  translationPrimary: {
    fontFamily: 'Lora_400Regular',
    fontSize: 20,
    lineHeight: 31,
    paddingTop: space.xxl,
  },
  explainToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  explainLabel: {
    flex: 1,
  },
  explanation: {
    paddingHorizontal: space.xl,
    paddingBottom: space.lg,
  },
  langSwitch: {
    marginBottom: space.md,
  },
  attribution: {
    marginTop: space.sm,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    minHeight: 52,
    paddingVertical: space.xs,
  },
});
