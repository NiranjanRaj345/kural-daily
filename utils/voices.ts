/** The parts of a text-to-speech voice we rank on (matches expo-speech's Voice). */
export interface VoiceLike {
  identifier: string;
  name: string;
  language: string;
  quality?: string;
}

export const isTamilVoice = (v: VoiceLike) =>
  /^ta([-_]|$)/i.test(v.language ?? '') || /tamil/i.test(v.name ?? '');

/**
 * How natural a voice is likely to sound. Higher is better.
 * - Voices the system marks as higher quality (iOS Enhanced/Premium downloads,
 *   Android quality above normal) come first.
 * - Names that indicate neural or premium synthesis come next.
 * - Offline ("local") voices are preferred over network ones, so Listen works
 *   without a connection; network voices still beat unmarked ones.
 */
export const voiceScore = (v: VoiceLike): number => {
  const id = `${v.identifier} ${v.name}`.toLowerCase();
  let score = 0;
  if (v.quality === 'Enhanced') score += 100;
  if (/premium/.test(id)) score += 60;
  if (/enhanced|neural|wavenet|studio|natural/.test(id)) score += 40;
  if (/(^|[-_.\s])local($|[-_.\s])/.test(id)) score += 20;
  else if (/network/.test(id)) score += 10;
  if (/^ta[-_]in$/i.test(v.language ?? '')) score += 5;
  return score;
};

export const isHighQuality = (v: VoiceLike) => voiceScore(v) >= 40;

/** Tamil voices, most natural first. */
export const rankTamilVoices = <T extends VoiceLike>(voices: T[]): T[] =>
  voices
    .filter(isTamilVoice)
    .sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name));
