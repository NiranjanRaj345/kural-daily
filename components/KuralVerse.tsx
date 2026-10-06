import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Kural } from '../types/kural';
import { useAppTheme, space, useType, readingSizes } from '../theme';
import { FitLines } from './FitLines';

interface KuralVerseProps {
  kural: Kural;
  size: number;
  /** Smallest size the lines may shrink to so each stays on one line; defaults from `size`. */
  minSize?: number;
  /** Mark the boundaries between the seven feet (சீர்) of the couplet. */
  showFeet?: boolean;
}

/**
 * The couplet set like a printed verse: two lines, left-aligned, the shorter
 * second line left as it is (the venba's 4 + 3 feet), with a margin rule in the
 * accent colour. The text shrinks a little where needed so each line stays on
 * one line, but never below `readingSizes().verseMin`; past that the lines wrap.
 */
export const KuralVerse: React.FC<KuralVerseProps> = ({ kural, size, minSize, showFeet = false }) => {
  const theme = useAppTheme();
  const type = useType();
  const renderLine = (line: string) => {
    if (!showFeet) return line;
    const words = line.trim().split(/\s+/);
    return words.map((word, i) => (
      <React.Fragment key={i}>
        {word}
        {i < words.length - 1 && <RNText style={{ color: theme.colors.primary }}>{' · '}</RNText>}
      </React.Fragment>
    ));
  };

  return (
    <View
      style={[styles.verse, { borderLeftColor: theme.colors.primary }]}
      accessible
      accessibilityLabel={`${kural.line1} ${kural.line2}`}
    >
      <FitLines
        lines={[kural.line1, kural.line2]}
        maxSize={size}
        minSize={minSize ?? minVerseSize(size)}
        styleAt={(s) => ({ ...type.kural(s), color: theme.colors.ink })}
        renderLine={renderLine}
        selectable
      />
    </View>
  );
};

/** The smallest the couplet may shrink to so it fits on two lines. */
export const minVerseSize = (size: number) => readingSizes(size).verseMin;

const styles = StyleSheet.create({
  verse: {
    borderLeftWidth: 3,
    paddingLeft: space.md,
    paddingVertical: space.xs,
  },
});
