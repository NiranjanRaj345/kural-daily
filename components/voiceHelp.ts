import { Alert, Linking, Platform } from 'react-native';
import { TTS_SETTINGS_INTENT } from '../services/SpeechService';

/** Android: the TTS engine's own "install voice data" screen (Speech Services by Google). */
const INSTALL_TTS_DATA_INTENT = 'android.speech.tts.engine.INSTALL_TTS_DATA';

/** Where to get a better (or any) Tamil voice on this platform. */
export const VOICE_HELP =
  Platform.OS === 'ios'
    ? 'On iPhone: Settings → Accessibility → Spoken Content → Voices → Tamil, then download a voice. The Enhanced voice sounds the most natural.'
    : 'Tap Download voices, choose Tamil (India) and download it. Then try each Tamil voice here with ▶ and pick the one that sounds best. If the button doesn’t open, use Voice settings → Speech Services by Google → Install voice data.';

const openAndroidIntent = async (action: string) => {
  try {
    await Linking.sendIntent(action);
    return true;
  } catch {
    return false;
  }
};

/** Opens the system text-to-speech settings (Android). Elsewhere, shows how to get there. */
export const openVoiceSettings = async () => {
  if (Platform.OS === 'android') {
    if (await openAndroidIntent(TTS_SETTINGS_INTENT)) return;
    await Linking.openSettings().catch(() => {});
    return;
  }
  Alert.alert('Tamil voices', VOICE_HELP);
};

/** Opens the screen that downloads voice data for the text-to-speech engine (Android). */
export const openVoiceDownload = async () => {
  if (Platform.OS === 'android') {
    if (await openAndroidIntent(INSTALL_TTS_DATA_INTENT)) return;
    await openVoiceSettings();
    return;
  }
  Alert.alert('Tamil voices', VOICE_HELP);
};

export const showNoTamilVoiceAlert = () => {
  Alert.alert(
    'No Tamil voice installed',
    `Your phone needs a Tamil voice to read Kurals aloud.\n\n${VOICE_HELP}`,
    Platform.OS === 'android'
      ? [
          { text: 'Not now', style: 'cancel' },
          { text: 'Download voices', onPress: openVoiceDownload },
        ]
      : [{ text: 'OK' }]
  );
};
