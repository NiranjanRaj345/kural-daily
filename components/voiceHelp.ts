import { Alert, Linking, Platform } from 'react-native';
import { TTS_SETTINGS_INTENT } from '../services/SpeechService';

/** Where to get a better (or any) Tamil voice on this platform. */
export const VOICE_HELP =
  Platform.OS === 'ios'
    ? 'Open Settings → Accessibility → Spoken Content → Voices → Tamil and download a voice. The Enhanced voice sounds the most natural.'
    : 'Open text-to-speech settings, choose Speech Services by Google, then Install voice data → Tamil (India). Download a voice and try each one; some sound much more natural than others.';

/** Opens the system text-to-speech settings where voices are installed. */
export const openVoiceSettings = async () => {
  if (Platform.OS === 'android') {
    try {
      await Linking.sendIntent(TTS_SETTINGS_INTENT);
      return;
    } catch {
      // Some devices don't expose the screen directly
    }
  }
  await Linking.openSettings().catch(() => {});
};

export const showNoTamilVoiceAlert = () => {
  Alert.alert(
    'No Tamil voice installed',
    `Your phone needs a Tamil voice to read Kurals aloud.\n\n${VOICE_HELP}`,
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Open settings', onPress: openVoiceSettings },
    ]
  );
};
