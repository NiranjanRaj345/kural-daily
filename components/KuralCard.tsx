import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text, SegmentedButtons, Button } from 'react-native-paper';
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
            style={[type.display(34), styles.number, { color: theme.colors.primary }]}
            accessibilityLabel={`Kural ${kural.number}`}
          >
            {kural.number}
          </Text>
          <View style={styles.folioText}>
            <View style={styles.folioMeta}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                அதிகாரம் {chapterNumber} · {position}/10
              </Text>
              {/* Shows once the Kural has counted as read (see useReadTracker) */}
              {isRead && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.readMark} accessibilityLabel="Read">
                  <MaterialCommunityIcons name="check-circle" size={13} color={theme.colors.primary} />
                  <Text variant="labelSmall" style={{ color: theme.colors.primary }}>Read</Text>
                </Animated.View>
              )}
            </View>
            <Text style={[type.tamilLabelStrong, { color: theme.colors.onSurface }]} numberOfLines={1}>
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

        {/* Meaning */}
        <Pressable
          onPress={() => {
            if (!showExplanation) markRead();
            if (speaking === 'meaning') stopSpeaking();
            setShowExplanation((v) => !v);
          }}
          accessibilityRole="button"
          accessibilityState={{ expanded: showExplanation }}
          style={[styles.explainToggle, { borderTopColor: theme.colors.rule }]}
        >
          <Text style={[type.tamilLabelStrong, { color: theme.colors.primary }]}>பொருள்</Text>
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
                onValueChange={(v) => {
                  if (speaking === 'meaning') stopSpeaking();
                  markRead();
                  setExplanationLang(v as 'ta' | 'en');
                }}
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
                explanationLang === 'ta' ? type.tamilBody : type.englishBody,
                {
                  fontSize: sizes.meaning,
                  lineHeight: Math.round(sizes.meaning * (explanationLang === 'ta' ? 1.8 : 1.65)),
                  color: theme.colors.onSurface,
                },
              ]}
            >
              {explanation}
            </Text>
            <View style={styles.explanationFooter}>
              <Button
                compact
                icon={speaking === 'meaning' ? 'stop-circle-outline' : 'volume-high'}
                onPress={() => handleSpeak('meaning')}
                style={styles.listenMeaning}
                accessibilityLabel={speaking === 'meaning' ? 'Stop reading the meaning' : 'Read the meaning aloud'}
              >
                {speaking === 'meaning' ? 'Stop' : explanationLang === 'ta' ? 'கேளுங்கள்' : 'Listen'}
              </Button>
              {explanationLang === 'ta' && (
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  உரை: மு. வரதராசனார்
                </Text>
              )}
            </View>
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
    gap: space.lg,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
  },
  number: {
    minWidth: 48,
    fontVariant: ['tabular-nums'],
  },
  folioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  readMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  folioText: {
    flex: 1,
  },
  verse: {
    // A little more width than the rest of the card, so the lines fit at a larger size
    paddingHorizontal: space.lg,
    paddingTop: space.xxl,
    paddingBottom: space.sm,
  },
  translation: {
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.xl,
  },
  translationPrimary: {
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
  explanationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: space.sm,
  },
  listenMeaning: {
    marginLeft: -space.sm,
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
