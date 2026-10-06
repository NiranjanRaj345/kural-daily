// Android 11+ hides other apps' screens unless they are declared in <queries>.
// The voice shortcuts in Listening settings open the text-to-speech settings and
// the TTS engine's "install voice data" screen, so declare both actions.
const { withAndroidManifest } = require('expo/config-plugins');

const ACTIONS = [
  'com.android.settings.TTS_SETTINGS',
  'android.speech.tts.engine.INSTALL_TTS_DATA',
];

module.exports = function withVoiceSettingsQueries(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    manifest.queries = manifest.queries ?? [{}];
    const queries = manifest.queries[0];
    queries.intent = queries.intent ?? [];
    for (const action of ACTIONS) {
      const exists = queries.intent.some((intent) =>
        (intent.action ?? []).some((a) => a.$?.['android:name'] === action)
      );
      if (!exists) queries.intent.push({ action: [{ $: { 'android:name': action } }] });
    }
    return cfg;
  });
};
