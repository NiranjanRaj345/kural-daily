import { isTamilVoice, rankTamilVoices, voiceScore } from '../utils/voices';

const v = (identifier: string, language: string, quality = 'Default', name = identifier) => ({ identifier, name, language, quality });

describe('Tamil voice ranking', () => {
  it('recognises Tamil voices only', () => {
    expect(isTamilVoice(v('ta-in-x-tag-local', 'ta-IN'))).toBe(true);
    expect(isTamilVoice(v('com.apple.voice.compact.ta-IN.Vani', 'ta-IN'))).toBe(true);
    expect(isTamilVoice(v('Tamil voice', 'und'))).toBe(true);
    expect(isTamilVoice(v('en-in-x-ene-local', 'en-IN'))).toBe(false);
    expect(isTamilVoice(v('te-in-x-tef-local', 'te-IN'))).toBe(false);
  });

  it('puts the most natural voice first', () => {
    const ranked = rankTamilVoices([
      v('ta-IN-language', 'ta-IN'),
      v('en-us-x-sfg-local', 'en-US', 'Enhanced'),
      v('ta-in-x-tag-network', 'ta-IN'),
      v('ta-in-x-tag-local', 'ta-IN'),
      v('com.apple.voice.enhanced.ta-IN.Vani', 'ta-IN', 'Enhanced'),
    ]);
    expect(ranked.map((x) => x.identifier)).toEqual([
      'com.apple.voice.enhanced.ta-IN.Vani',
      'ta-in-x-tag-local',
      'ta-in-x-tag-network',
      'ta-IN-language',
    ]);
  });

  it('scores system quality above name hints', () => {
    expect(voiceScore(v('plain', 'ta-IN', 'Enhanced'))).toBeGreaterThan(voiceScore(v('neural', 'ta-IN')));
  });
});
