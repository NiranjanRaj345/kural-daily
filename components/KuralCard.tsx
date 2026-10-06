import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Kural } from '../types/kural';
import { useSettingsStore } from '../store/useSettingsStore';
import { getChapterNumber, getPositionInChapter } from '../services/DataService';
import { ShareModal } from './ShareModal';
import { hasTamilVoice, speakKural, speakMeaning, stopSpeaking } from '../services/SpeechService';
import { showNoTamilVoiceAlert } from './voiceHelp';
import { KuralVerse } from './KuralVerse';
import { MemorizeSheet, MemorizeMode } from './MemorizeSheet';
import { useAppTheme, space, radius, useType } from '../theme';
import { useReadingSizes } from '../hooks/useReadingSizes';
import { useReadTracker } from '../hooks/useReadTracker';

interface KuralCardProps {
  kural: Kural;
  /** Open the explanation by default (e.g. on the Today screen). */
  defaultExpanded?: boolean;
  /** False while something covers the card, so the time doesn't count as reading. */
  visible?: boolean;
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

export const KuralCard: React.FC<KuralCardProps> = ({ kural, defaultExpanded = false, visible = true }) => {
  const theme = useAppTheme();
  const type = useType();
  const showEnglish = useSettingsStore((s) => s.showEnglish);
  const showTamil = useSettingsStore((s) => s.showTamil);
  const isFavorite = useSettingsStore((s) => s.favorites.includes(kural.number));
  const isLearning = useSettingsStore((s) => !!s.learning[kural.number]);
  const isRead = useSettingsStore((s) => s.history.includes(kural.number));
  const toggleFavorite = useSettingsStore((s) => s.toggleFavorite);
  // The text-size setting scales all the reading text, the couplet always largest
  const sizes = useReadingSizes();
  const speechRate = useSettingsStore((s) => s.speechRate);
  const selectedVoiceIdentifier = useSettingsStore((s) => s.selectedVoiceIdentifier);

  const [showExplanation, setShowExplanation] = useState(defaultExpanded);
  const [explanationLang, setExplanationLang] = useState<'ta' | 'en'>(showTamil ? 'ta' : 'en');
  // What is being read aloud: the couplet or its meaning
  const [speaking, setSpeaking] = useState<'kural' | 'meaning' | null>(null);
  const isSpeakingRef = useRef(false);
  const markRead = useReadTracker(kural.number, visible);
  const [showShareModal, setShowShareModal] = useState(false);
  const [memorizing, setMemorizing] = useState<{ queue: number[]; mode: MemorizeMode } | null>(null);

  // Reset per-kural state. It counts as read after a few seconds or on any interaction (useReadTracker).
  useEffect(() => {
    setShowExplanation(defaultExpanded);
  }, [kural.number, defaultExpanded]);

  // Keep the explanation language valid if a language is turned off in settings
  useEffect(() => {
    if (!showTamil && explanationLang === 'ta') setExplanationLang('en');
    if (!showEnglish && explanationLang === 'en') setExplanationLang('ta');
  }, [showTamil, showEnglish, explanationLang]);

  const updateSpeaking = (value: 'kural' | 'meaning' | null) => {
    isSpeakingRef.current = value !== null;
    setSpeaking(value);
  };

  // Don't keep reading aloud after the card is closed or replaced
  useEffect(() => {
    return () => {
      if (isSpeakingRef.current) stopSpeaking();
    };
  }, [kural.number]);

  const handleSpeak = async (what: 'kural' | 'meaning') => {
    haptic();
    const wasSpeaking = speaking;
    if (wasSpeaking) stopSpeaking();
    if (wasSpeaking === what) return; // the same button again stops it
    markRead();
    const lang = what === 'meaning' ? explanationLang : 'ta';
    if (lang === 'ta' && !(await hasTamilVoice())) {
      showNoTamilVoiceAlert();
      return;
    }
    updateSpeaking(what);
    const options = { voice: selectedVoiceIdentifier, rate: speechRate, onEnd: () => updateSpeaking(null) };
    if (what === 'kural') speakKural(kural, options);
    else speakMeaning(explanation, lang, options);
  };

  const handleFavoritePress = () => {
    haptic(isFavorite ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    if (!isFavorite) markRead();
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
            style={[type.display(30), styles.number, { color: theme.colors.primary }]}
            accessibilityLabel={`Kural ${kural.number}`}
          >
            {kural.number}
          </Text>
          <View style={styles.folioText}>
            <Text style={[type.tamilLabelStrong, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {kural.chap_tam}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
              அதிகாரம் {chapterNumber} · {position}/10{kural.chap_eng ? ` · ${kural.chap_eng}` : ''}
            </Text>
          </View>
          {/* Shows once the Kural has counted as read (see useReadTracker) */}
          {isRead && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={[styles.readMark, { backgroundColor: theme.colors.primaryContainer }]}
              accessibilityLabel="Read"
            >
              <MaterialCommunityIcons name="check" size={13} color={theme.colors.onPrimaryContainer} />
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer }}>Read</Text>
            </Animated.View>
          )}
        </View>

        {/* The couplet */}
        {showTamil && (
          <View style={styles.verse}>
            <KuralVerse kural={kural} size={sizes.verse} minSize={sizes.verseMin} />
          </View>
        )}

        {showEnglish && (
          <Text
            selectable
            style={[
              type.translation,
              styles.translation,
              { fontSize: sizes.translation, lineHeight: Math.round(sizes.translation * 1.6) },
              { color: showTamil ? theme.colors.onSurfaceVariant : theme.colors.ink },
              !showTamil && [
                type.englishBody,
                styles.translationPrimary,
                { fontSize: sizes.verseMin + 2, lineHeight: Math.round((sizes.verseMin + 2) * 1.55) },
              ],
            ]}
          >
            {kural.eng}
          </Text>
        )}

        {/* Meaning: one header row with its language and listen controls */}
        <View style={[styles.explainHeader, { borderTopColor: theme.colors.rule }]}>
          <Pressable
            onPress={() => {
              if (!showExplanation) markRead();
              if (speaking === 'meaning') stopSpeaking();
              setShowExplanation((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityLabel={showExplanation ? 'Hide the meaning' : 'Show the meaning'}
            accessibilityState={{ expanded: showExplanation }}
            hitSlop={8}
            style={styles.explainTitle}
          >
            <Text style={[type.tamilLabelStrong, { color: theme.colors.primary }]}>பொருள்</Text>
            <MaterialCommunityIcons
              name={showExplanation ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.primary}
            />
          </Pressable>
          {showExplanation && bothLanguages && (
            <View style={[styles.langToggle, { borderColor: theme.colors.outlineVariant }]} accessibilityRole="radiogroup">
              {(['ta', 'en'] as const).map((lang) => {
                const selected = explanationLang === lang;
                return (
                  <Pressable
                    key={lang}
                    onPress={() => {
                      if (selected) return;
                      if (speaking === 'meaning') stopSpeaking();
                      markRead();
                      setExplanationLang(lang);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={lang === 'ta' ? 'Tamil meaning' : 'English meaning'}
                    style={[styles.langOption, selected && { backgroundColor: theme.colors.secondaryContainer }]}
                  >
                    <Text
                      style={[
                        lang === 'ta' ? type.tamilLabelStrong : type.uiMedium,
                        styles.langText,
                        { color: selected ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {lang === 'ta' ? 'தமிழ்' : 'EN'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          {showExplanation && (
            <IconButton
              icon={speaking === 'meaning' ? 'stop-circle-outline' : 'volume-high'}
              size={20}
              iconColor={theme.colors.primary}
              onPress={() => handleSpeak('meaning')}
              style={styles.explainListen}
              accessibilityLabel={speaking === 'meaning' ? 'Stop reading the meaning' : 'Read the meaning aloud'}
            />
          )}
        </View>

        {showExplanation && (
          <Animated.View entering={FadeIn.duration(250)} style={styles.explanation}>
            <Text
              selectable
              style={[
                explanationLang === 'ta' ? type.tamilBody : type.englishBody,
                {
                  fontSize: sizes.meaning,
                  lineHeight: Math.round(sizes.meaning * (explanationLang === 'ta' ? 1.75 : 1.6)),
                  color: theme.colors.onSurface,
                },
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
        <View style={[styles.actions, { borderTopColor: theme.colors.rule }]}>
          <ActionButton
            icon={isFavorite ? 'bookmark' : 'bookmark-outline'}
            label={isFavorite ? 'Saved' : 'Save'}
            active={isFavorite}
            activeColor={theme.colors.primary}
            onPress={handleFavoritePress}
            accessibilityLabel={isFavorite ? 'Remove from saved' : 'Save Kural'}
          />
          <ActionButton
            icon={speaking === 'kural' ? 'stop-circle-outline' : 'volume-high'}
            label={speaking === 'kural' ? 'Stop' : 'Listen'}
            active={speaking === 'kural'}
            onPress={() => handleSpeak('kural')}
            accessibilityLabel={speaking === 'kural' ? 'Stop reading' : 'Read the Kural aloud'}
          />
          <ActionButton
            icon={isLearning ? 'school' : 'school-outline'}
            label={isLearning ? 'Learning' : 'Learn'}
            active={isLearning}
            onPress={() => {
              haptic();
              markRead();
              // Fixed when the sheet opens: grading a new Kural adds it to the review list,
              // which must not switch the open session into practice mode.
              // Already learning: practise without changing its review schedule.
              setMemorizing({ queue: [kural.number], mode: isLearning ? 'practice' : 'learn' });
            }}
            accessibilityLabel={isLearning ? 'Practise this Kural' : 'Learn this Kural by heart'}
          />
          <ActionButton
            icon="share-variant-outline"
            label="Share"
            onPress={() => {
              markRead();
              setShowShareModal(true);
            }}
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
  folio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
  },
  number: {
    minWidth: 44,
    fontVariant: ['tabular-nums'],
  },
  readMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  folioText: {
    flex: 1,
  },
  verse: {
    // A little more width than the rest of the card, so the lines fit at a larger size
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
  },
  translation: {
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  translationPrimary: {
    paddingTop: space.lg,
  },
  explainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 48,
    paddingLeft: space.xl,
    paddingRight: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  explainTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 44,
  },
  langToggle: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  langOption: {
    minWidth: 48,
    minHeight: 32,
    paddingHorizontal: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 13,
  },
  explainListen: {
    margin: 0,
  },
  explanation: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
  },
  attribution: {
    marginTop: space.xs,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: space.xs,
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
