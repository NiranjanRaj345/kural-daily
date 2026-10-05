import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Text, Button, Chip, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Kural } from '../types/kural';
import { useSettingsStore } from '../store/useSettingsStore';
import { SheetModal } from './SheetModal';

interface ShareModalProps {
  visible: boolean;
  onDismiss: () => void;
  kural: Kural;
}

const THEMES = [
  { id: 'white', name: 'Classic', colors: ['#ffffff', '#ffffff'] as const, textColor: '#000000', subTextColor: '#666666' },
  { id: 'dark', name: 'Dark', colors: ['#1a1a1a', '#1a1a1a'] as const, textColor: '#ffffff', subTextColor: '#aaaaaa' },
  { id: 'sepia', name: 'Sepia', colors: ['#f4ecd8', '#f4ecd8'] as const, textColor: '#5b4636', subTextColor: '#8c6b5d' },
  { id: 'sunrise', name: 'Sunrise', colors: ['#ff9a9e', '#fad0c4'] as const, textColor: '#2d3436', subTextColor: '#636e72' },
  { id: 'ocean', name: 'Ocean', colors: ['#2193b0', '#6dd5ed'] as const, textColor: '#ffffff', subTextColor: '#e0f7fa' },
  { id: 'royal', name: 'Royal', colors: ['#141E30', '#243B55'] as const, textColor: '#ffffff', subTextColor: '#b2bec3' },
];

export const buildShareText = (
  kural: Kural,
  options: { tamil: boolean; english: boolean; explanation: boolean }
) => {
  let message = `Thirukkural #${kural.number}`;
  if (options.tamil) message += `\n\n${kural.line1}\n${kural.line2}`;
  if (options.english) message += `\n\nMeaning:\n${kural.eng}`;
  if (options.explanation) {
    if (options.tamil) message += `\n\nTamil Explanation:\n${kural.tam_exp}`;
    if (options.english) message += `\n\nEnglish Explanation:\n${kural.eng_exp}`;
  }
  return message;
};

export const ShareModal: React.FC<ShareModalProps> = ({ visible, onDismiss, kural }) => {
  const theme = useTheme();
  const {
    shareIncludeTamil, shareIncludeEnglish, shareIncludeExplanation,
    toggleShareIncludeTamil, toggleShareIncludeEnglish, toggleShareIncludeExplanation,
  } = useSettingsStore();
  const [selectedThemeId, setSelectedThemeId] = useState('white');
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewRef = useRef<View>(null);

  const selectedTheme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];
  const options = { tamil: shareIncludeTamil, english: shareIncludeEnglish, explanation: shareIncludeExplanation };

  const handleShareImage = async () => {
    setError(null);
    setSharing(true);
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile'
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: `Thirukkural #${kural.number}` });
      } else {
        setError('Image sharing is not available on this device. Try sharing as text.');
      }
    } catch (e) {
      console.error("Sharing failed", e);
      setError('Could not create the image. Try sharing as text.');
    } finally {
      setSharing(false);
    }
  };

  const handleShareText = async () => {
    setError(null);
    try {
      await Share.share({ message: buildShareText(kural, options) });
    } catch (e) {
      console.error("Text share failed", e);
    }
  };

  // Keep at least one language selected so the share is never empty
  const onToggleTamil = () => { if (shareIncludeEnglish || !shareIncludeTamil) toggleShareIncludeTamil(); };
  const onToggleEnglish = () => { if (shareIncludeTamil || !shareIncludeEnglish) toggleShareIncludeEnglish(); };

  return (
    <SheetModal visible={visible} onClose={onDismiss} title="Share Kural" scrollable={false}>
      <ScrollView style={styles.contentScroll}>
        {/* Preview Area */}
        <View style={[styles.previewContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View
            ref={viewRef}
            collapsable={false}
            style={[styles.cardWrapper, !shareIncludeExplanation && styles.cardWrapperFixed]}
          >
            <LinearGradient
              colors={selectedTheme.colors}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.kuralNumber, { color: selectedTheme.subTextColor }]}>
                  Kural {kural.number}
                </Text>
                <Text style={[styles.chapter, { color: selectedTheme.subTextColor }]} numberOfLines={1}>
                  {shareIncludeTamil ? kural.chap_tam : kural.chap_eng ?? kural.chap_tam}
                </Text>
              </View>

              {shareIncludeTamil && (
                <View style={styles.textContainer}>
                  <Text style={[styles.tamilText, { color: selectedTheme.textColor }]}>
                    {kural.line1}
                  </Text>
                  <Text style={[styles.tamilText, { color: selectedTheme.textColor }]}>
                    {kural.line2}
                  </Text>
                </View>
              )}

              {shareIncludeTamil && shareIncludeEnglish && (
                <View style={[styles.divider, { backgroundColor: selectedTheme.subTextColor, opacity: 0.3 }]} />
              )}

              {shareIncludeEnglish && (
                <Text style={[styles.englishText, { color: selectedTheme.textColor }]}>
                  {kural.eng}
                </Text>
              )}

              {shareIncludeExplanation && (
                <View style={styles.explanation}>
                  {shareIncludeTamil && (
                    <Text style={[styles.explanationText, { color: selectedTheme.textColor }]}>
                      {kural.tam_exp}
                    </Text>
                  )}
                  {shareIncludeEnglish && (
                    <Text style={[styles.explanationText, { color: selectedTheme.textColor }]}>
                      {kural.eng_exp}
                    </Text>
                  )}
                </View>
              )}

              <Text style={[styles.footer, { color: selectedTheme.subTextColor }]}>
                Thirukkural Daily
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Content options (saved for next time) */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Include</Text>
        <View style={styles.optionRow}>
          <Chip selected={shareIncludeTamil} showSelectedCheck onPress={onToggleTamil} style={styles.optionChip}>
            Tamil
          </Chip>
          <Chip selected={shareIncludeEnglish} showSelectedCheck onPress={onToggleEnglish} style={styles.optionChip}>
            English
          </Chip>
          <Chip selected={shareIncludeExplanation} showSelectedCheck onPress={toggleShareIncludeExplanation} style={styles.optionChip}>
            Explanation
          </Chip>
        </View>

        {/* Theme Selector */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Choose Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeSelector}>
          {THEMES.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setSelectedThemeId(t.id)}
              accessibilityLabel={`${t.name} style`}
              style={[
                styles.themeOption,
                selectedThemeId === t.id && { borderColor: theme.colors.primary, borderWidth: 2 }
              ]}
            >
              <LinearGradient
                colors={t.colors}
                style={styles.themePreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text variant="labelSmall" style={{ textAlign: 'center', marginTop: 4 }}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={[styles.actions, { borderTopColor: theme.colors.outlineVariant }]}>
        {error && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 8 }}>
            {error}
          </Text>
        )}
        <Button
          mode="contained"
          icon="image-outline"
          onPress={handleShareImage}
          loading={sharing}
          disabled={sharing}
          style={styles.shareButton}
        >
          Share Image
        </Button>
        <Button mode="outlined" icon="text" onPress={handleShareText} style={styles.shareButton}>
          Share as Text
        </Button>
      </View>
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  contentScroll: {
    flex: 1,
  },
  previewContainer: {
    padding: 20,
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 320,
    minHeight: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardWrapperFixed: {
    aspectRatio: 4 / 5, // Portrait aspect ratio for social media
    minHeight: undefined,
  },
  card: {
    flex: 1,
    padding: 24,
    paddingBottom: 48,
    borderRadius: 16,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  kuralNumber: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chapter: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
  textContainer: {
    marginBottom: 20,
  },
  tamilText: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'NotoSansTamil_700Bold',
  },
  divider: {
    height: 1,
    width: '40%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  englishText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  explanation: {
    marginTop: 20,
    gap: 10,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    fontSize: 12,
    opacity: 0.8,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  optionChip: {
    marginRight: 0,
  },
  themeSelector: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  themeOption: {
    marginRight: 12,
    borderRadius: 8,
    padding: 2,
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  actions: {
    padding: 16,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  shareButton: {
    paddingVertical: 2,
  },
});
