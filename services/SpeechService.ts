import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { Kural } from '../types/kural';
import { rankTamilVoices } from '../utils/voices';

/*
 * Reading Kurals aloud with the device's text-to-speech engine.
 *
 * How natural it sounds depends on the voices installed on the phone. We pick
 * the best Tamil voice automatically (unless the user chose one), and recite
 * the couplet the way it is read aloud: line one, a short breath, line two.
 */

/** Pause between the two lines of the couplet. */
const LINE_PAUSE_MS = 650;
const SAMPLE_TEXT = 'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு';

let voicesCache: Speech.Voice[] | null = null;

export const loadVoices = async (force = false): Promise<Speech.Voice[]> => {
  if (voicesCache && !force) return voicesCache;
  try {
    voicesCache = await Speech.getAvailableVoicesAsync();
  } catch {
    voicesCache = [];
  }
  return voicesCache;
};

/** Tamil voices on this device, most natural first. */
export const getTamilVoices = async (force = false) => rankTamilVoices(await loadVoices(force));

/** The voice used when the user hasn't picked one. */
export const getAutomaticVoice = async (): Promise<Speech.Voice | undefined> => (await getTamilVoices())[0];

/**
 * Whether a Tamil voice is available. Some engines report no voices until they
 * have started, so an empty list counts as "unknown" and returns true.
 */
export const hasTamilVoice = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return true;
  const voices = await loadVoices(true);
  if (voices.length === 0) return true;
  return rankTamilVoices(voices).length > 0;
};

// Only one recitation at a time. Each has an id; starting a new one or calling
// stop ends the previous one and calls its onEnd exactly once.
let currentId = 0;
let currentEnd: (() => void) | null = null;
let pauseTimer: ReturnType<typeof setTimeout> | null = null;

const finish = (id: number) => {
  if (id !== currentId) return;
  const end = currentEnd;
  currentEnd = null;
  end?.();
};

export const stopSpeaking = () => {
  if (pauseTimer) clearTimeout(pauseTimer);
  pauseTimer = null;
  const end = currentEnd;
  currentEnd = null;
  currentId += 1;
  Speech.stop();
  end?.();
};

// A trailing full stop is read as a long pause or, by some engines, aloud.
const cleanLine = (line: string) => line.replace(/[.,;:!?]+\s*$/, '').trim();

interface SpeakOptions {
  /** Voice identifier; undefined picks the best Tamil voice (for Tamil). */
  voice?: string | null;
  /** Defaults to Tamil. For English the engine's own voice for the language is used. */
  language?: 'ta-IN' | 'en-IN';
  rate?: number;
  /** Called once when the recitation ends, is stopped, or fails. */
  onEnd?: () => void;
}

const speakLines = async (lines: string[], { voice, language = 'ta-IN', rate = 0.9, onEnd }: SpeakOptions) => {
  stopSpeaking();
  const id = currentId;
  currentEnd = onEnd ?? null;

  const voiceId = language === 'ta-IN' ? voice ?? (await getAutomaticVoice())?.identifier : undefined;
  if (id !== currentId) return; // superseded while loading voices

  const speakLine = (index: number) => {
    if (id !== currentId) return;
    Speech.speak(lines[index], {
      language,
      voice: voiceId,
      rate,
      pitch: 1.0,
      onDone: () => {
        if (id !== currentId) return;
        if (index < lines.length - 1) {
          pauseTimer = setTimeout(() => speakLine(index + 1), LINE_PAUSE_MS);
        } else {
          finish(id);
        }
      },
      onStopped: () => finish(id),
      onError: () => finish(id),
    });
  };

  speakLine(0);
};

export const speakKural = (kural: Kural, options: SpeakOptions) =>
  speakLines([cleanLine(kural.line1), cleanLine(kural.line2)], options);

/**
 * Reads a Kural's explanation: the Tamil one in the chosen Tamil voice, the
 * English one in the phone's English voice. Sentence by sentence, with the same
 * short pause between them as between the lines of the couplet.
 */
export const speakMeaning = (text: string, lang: 'ta' | 'en', options: Omit<SpeakOptions, 'language'>) =>
  speakLines(splitSentences(text), { ...options, language: lang === 'ta' ? 'ta-IN' : 'en-IN', voice: lang === 'ta' ? options.voice : null });

/** Splits prose into sentences (keeping their full stops) so long text is read in natural breaths. */
export const splitSentences = (text: string): string[] => {
  const parts = text.match(/[^.!?]+[.!?]*/g) ?? [];
  const sentences = parts.map((p) => p.trim()).filter(Boolean);
  return sentences.length > 0 ? sentences : [text.trim()];
};

/** A short sample for previewing a voice. */
export const speakSample = (voice: string | null, rate: number) =>
  speakLines([SAMPLE_TEXT], { voice, rate });

/** Opens the system screen where Tamil voices can be installed (Android). */
export const TTS_SETTINGS_INTENT = 'com.android.settings.TTS_SETTINGS';
