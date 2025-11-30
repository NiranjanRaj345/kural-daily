import React, { useState, useRef } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, IconButton, Portal, useTheme, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Kural } from '../types/kural';

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

export const ShareModal: React.FC<ShareModalProps> = ({ visible, onDismiss, kural }) => {
  const theme = useTheme();
  const [selectedThemeId, setSelectedThemeId] = useState('white');
  const viewRef = useRef<View>(null);

  const selectedTheme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];

  const handleShare = async () => {
    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile'
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.error("Sharing failed", error);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
              <Text variant="titleLarge">Share Kural</Text>
              <IconButton icon="close" onPress={onDismiss} />
            </View>

            <ScrollView style={styles.contentScroll}>
              {/* Preview Area */}
              <View style={styles.previewContainer}>
                <View ref={viewRef} collapsable={false} style={styles.cardWrapper}>
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
                      <Text style={[styles.chapter, { color: selectedTheme.subTextColor }]}>
                        {kural.chap_tam}
                      </Text>
                    </View>

                    <View style={styles.textContainer}>
                      <Text style={[styles.tamilText, { color: selectedTheme.textColor }]}>
                        {kural.line1}
                      </Text>
                      <Text style={[styles.tamilText, { color: selectedTheme.textColor }]}>
                        {kural.line2}
                      </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: selectedTheme.subTextColor, opacity: 0.3 }]} />

                    <Text style={[styles.englishText, { color: selectedTheme.textColor }]}>
                      {kural.eng}
                    </Text>

                    <Text style={[styles.footer, { color: selectedTheme.subTextColor }]}>
                      Thirukkural Daily
                    </Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Theme Selector */}
              <Text variant="titleMedium" style={styles.sectionTitle}>Choose Style</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeSelector}>
                {THEMES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedThemeId(t.id)}
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

            <View style={styles.actions}>
              <Button mode="contained" icon="share-variant" onPress={handleShare} style={styles.shareButton}>
                Share Image
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contentScroll: {
    flex: 1,
  },
  previewContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  cardWrapper: {
    width: '100%',
    aspectRatio: 4/5, // Portrait aspect ratio for social media
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  card: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  shareButton: {
    paddingVertical: 6,
  },
});