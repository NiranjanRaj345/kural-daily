import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Kural } from '../types/kural';
import { useAppTheme, space, useType } from '../theme';

interface KuralVerseProps {
  kural: Kural;
  size: number;
  /** Mark the boundaries between the seven feet (சீர்) of the couplet. */
  showFeet?: boolean;
}

/**
 * The couplet set like a printed verse: left-aligned, the shorter second line
 * left as it is (the venba's 4 + 3 feet), with a margin rule in the accent colour.
 */
export const KuralVerse: React.FC<KuralVerseProps> = ({ kural, size, showFeet = false }) => {
  const theme = useAppTheme();
  const type = useType();
  const style = [type.kural(size), { color: theme.colors.ink }];
  const renderLine = (line: string) => {
    if (!showFeet) return line;
    const words = line.trim().split(/\s+/);
    return words.map((word, i) => (
      <React.Fragment key={i}>
        {word}
        {i < words.length - 1 && <RNText style={{ color: theme.colors.primary }}>{'  ·  '}</RNText>}
      </React.Fragment>
    ));
  };

  return (
    <View
      style={[styles.verse, { borderLeftColor: theme.colors.primary }]}
      accessible
      accessibilityLabel={`${kural.line1} ${kural.line2}`}
    >
      <RNText style={style} selectable>{renderLine(kural.line1)}</RNText>
      {/* A small gap keeps the two lines distinct when a long first line wraps on narrow screens */}
      <RNText style={[style, { marginTop: Math.round(size * 0.45) }]} selectable>{renderLine(kural.line2)}</RNText>
    </View>
  );
};

const styles = StyleSheet.create({
  verse: {
    borderLeftWidth: 3,
    paddingLeft: space.lg,
    paddingVertical: space.xs,
  },
});
