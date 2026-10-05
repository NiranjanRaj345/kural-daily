import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { List, Text, IconButton, Divider, Button, Switch } from 'react-native-paper';
import * as Speech from 'expo-speech';
import { useSettingsStore } from '../../store/useSettingsStore';
import { loadVoices, speakSample, stopSpeaking } from '../../services/SpeechService';
import { isHighQuality, isTamilVoice, rankTamilVoices } from '../../utils/voices';
import { SheetModal } from '../SheetModal';
import { EmptyState } from '../ui/EmptyState';
import { VOICE_HELP, openVoiceSettings } from '../voiceHelp';
import { useAppTheme, space, radius } from '../../theme';

interface VoicePickerSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Choose the voice for Listen. Automatic picks the most natural Tamil voice installed. */
export const VoicePickerSheet: React.FC<VoicePickerSheetProps> = ({ visible, onClose }) => {
  const theme = useAppTheme();
  const selected = useSettingsStore((s) => s.selectedVoiceIdentifier);
  const setSelected = useSettingsStore((s) => s.setSelectedVoiceIdentifier);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [showOther, setShowOther] = useState(false);

  const refresh = useCallback(async () => {
    setVoices(await loadVoices(true));
  }, []);

  useEffect(() => {
    if (visible) refresh();
  }, [visible, refresh]);

  const tamil = rankTamilVoices(voices);
  const best = tamil[0];
  const list = showOther ? [...tamil, ...voices.filter((v) => !isTamilVoice(v))] : tamil;
  const bestIsNatural = !!best && isHighQuality(best);

  const close = () => {
    stopSpeaking();
    onClose();
  };

  const radio = (on: boolean) => {
    const RadioIcon = (props: { color: string; style?: object }) => (
      <List.Icon {...props} icon={on ? 'radiobox-marked' : 'radiobox-blank'} color={theme.colors.primary} />
    );
    return RadioIcon;
  };

  return (
    <SheetModal
      visible={visible}
      onClose={close}
      title="Reading voice"
      subtitle="Voices come from your phone's text-to-speech"
      scrollable={false}
      headerRight={<IconButton icon="refresh" onPress={refresh} accessibilityLabel="Refresh voices" />}
    >
      <FlatList
        data={list}
        keyExtractor={(item) => item.identifier}
        contentContainerStyle={{ paddingBottom: space.xl }}
        ListHeaderComponent={
          <View>
            {(!bestIsNatural || tamil.length === 0) && Platform.OS !== 'web' && (
              <View style={[styles.help, { backgroundColor: theme.colors.flameContainer }]}>
                <Text variant="titleSmall" style={{ color: theme.colors.onFlameContainer }}>
                  {tamil.length === 0 ? 'No Tamil voice installed' : 'Want a more natural voice?'}
                </Text>
                <Text variant="bodySmall" style={[styles.helpText, { color: theme.colors.onFlameContainer }]}>
                  {VOICE_HELP}
                </Text>
                <Button mode="contained-tonal" compact icon="cog-outline" onPress={openVoiceSettings} style={styles.helpButton}>
                  Open voice settings
                </Button>
              </View>
            )}
            <List.Item
              title="Automatic"
              description={best ? `Uses the most natural Tamil voice: ${best.name}` : 'Uses your phone’s default voice'}
              descriptionNumberOfLines={2}
              onPress={() => setSelected(null)}
              left={radio(!selected)}
              right={() => (
                <IconButton icon="play-circle-outline" onPress={() => speakSample(null, speechRate)} accessibilityLabel="Preview automatic voice" />
              )}
            />
            <Divider />
          </View>
        }
        ItemSeparatorComponent={() => <Divider style={{ marginLeft: 56 }} />}
        renderItem={({ item }) => {
          const natural = isTamilVoice(item) && isHighQuality(item);
          return (
            <List.Item
              title={item.name}
              description={`${item.language}${natural ? ' · Natural' : ''}${item === best ? ' · Recommended' : ''}`}
              onPress={() => setSelected(item.identifier)}
              left={radio(selected === item.identifier)}
              right={() => (
                <IconButton
                  icon="play-circle-outline"
                  onPress={() => speakSample(item.identifier, speechRate)}
                  accessibilityLabel={`Preview ${item.name}`}
                />
              )}
            />
          );
        }}
        ListEmptyComponent={
          tamil.length === 0 && !showOther ? (
            <EmptyState
              icon="account-voice-off"
              title="No Tamil voices found"
              message="Install a Tamil voice for your phone's text-to-speech, then tap refresh."
            />
          ) : null
        }
        ListFooterComponent={
          voices.length > tamil.length ? (
            <List.Item
              title="Show voices in other languages"
              description="They can't pronounce Tamil well"
              right={() => <Switch value={showOther} onValueChange={setShowOther} />}
              style={[styles.footer, { borderTopColor: theme.colors.outlineVariant }]}
            />
          ) : null
        }
      />
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  help: {
    margin: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
  },
  helpText: {
    marginTop: space.xs,
    lineHeight: 19,
  },
  helpButton: {
    alignSelf: 'flex-start',
    marginTop: space.md,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: space.sm,
  },
});
