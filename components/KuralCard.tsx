import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Kural } from '../types/kural';
import { useSettingsStore } from '../store/useSettingsStore';
import { ShareModal, buildShareText } from './ShareModal';
import { useAppTheme, space, radius, tamilText } from '../theme';

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
  const toggleFavorite = useSettingsStore((s) => s.toggleFavorite);
  const addToHistory = useSettingsStore((s) => s.addToHistory);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const selectedVoiceIdentifier = useSettingsStore((s) => s.selectedVoiceIdentifier);

  const [showExplanation, setShowExplanation] = useState(defaultExpanded);
  const [explanationLang, setExplanationLang] = useState<'ta' | 'en'>(showTamil ? 'ta' : 'en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

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
      onDone: () => updateSpeaking(false),
      onStopped: () => updateSpeaking(false),
      onError: () => updateSpeaking(false),
    });
  };

  const handleCopy = async () => {
    haptic();
    await Clipboard.setStringAsync(buildShareText(kural, { tamil: true, english: true, explanation: true }));
    setCopied(true);
  };

  const handleFavoritePress = () => {
    haptic(isFavorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(kural.number);
  };

  const bothLanguages = showTamil && showEnglish;
  const explanation = explanationLang === 'ta' ? kural.tam_exp : kural.eng_exp;

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <ShareModal visible={showShareModal} onDismiss={() => setShowShareModal(false)} kural={kural} />

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        {/* Header: number + where it sits in the book */}
        <View style={styles.header}>
          <View style={[styles.numberPill, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
              குறள் {kural.number}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[tamilText.label, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {kural.chap_tam}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
              {[kural.chap_eng, kural.sect_eng].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </View>

        {/* The couplet */}
        {showTamil && (
          <View style={styles.couplet}>
            <View style={[styles.accentRule, { backgroundColor: theme.colors.accent }]} />
            <Text
              style={[tamilText.kural(fontSize), styles.coupletLine, { color: theme.colors.onSurface }]}
              selectable
            >
              {kural.line1}
            </Text>
            <Text
              style={[tamilText.kural(fontSize), styles.coupletLine, { color: theme.colors.onSurface }]}
              selectable
            >
              {kural.line2}
            </Text>
          </View>
        )}

        {showEnglish && (
          <Text
            variant="bodyLarge"
            selectable
            style={[
              styles.translation,
              { color: showTamil ? theme.colors.onSurfaceVariant : theme.colors.onSurface },
              !showTamil && styles.translationPrimary,
            ]}
          >
            {kural.eng}
          </Text>
        )}

        {/* Explanation */}
        <Pressable
          onPress={() => setShowExplanation((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded: showExplanation }}
          style={[styles.explainToggle, { borderTopColor: theme.colors.outlineVariant }]}
        >
          <MaterialCommunityIcons name="text-box-outline" size={18} color={theme.colors.primary} />
          <Text variant="labelLarge" style={[styles.explainLabel, { color: theme.colors.primary }]}>
            Explanation
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
              style={[
                explanationLang === 'ta' ? tamilText.body : styles.englishBody,
                { color: theme.colors.onSurface },
              ]}
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
        <View style={[styles.actions, { borderTopColor: theme.colors.outlineVariant }]}>
          <ActionButton
            icon={isFavorite ? 'bookmark' : 'bookmark-outline'}
            label={isFavorite ? 'Saved' : 'Save'}
            active={isFavorite}
            activeColor={theme.colors.tertiary}
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
          <ActionButton icon="share-variant-outline" label="Share" onPress={() => setShowShareModal(true)} />
          <ActionButton
            icon={copied ? 'check' : 'content-copy'}
            label={copied ? 'Copied' : 'Copy'}
            active={copied}
            activeColor={theme.colors.success}
            onPress={handleCopy}
            accessibilityLabel="Copy text"
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
  },
  numberPill: {
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  headerText: {
    flex: 1,
  },
  couplet: {
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
    paddingBottom: space.sm,
  },
  accentRule: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: space.lg,
  },
  coupletLine: {
    textAlign: 'center',
  },
  translation: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    paddingHorizontal: space.xxl,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
  translationPrimary: {
    fontStyle: 'normal',
    fontSize: 19,
    lineHeight: 28,
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
  englishBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 24,
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
