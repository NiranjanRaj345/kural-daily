import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, TextStyle, View } from 'react-native';

interface FitLinesProps {
  lines: string[];
  /** Largest size to use (the reader's text size). */
  maxSize: number;
  /** Smallest size worth shrinking to; below this the lines wrap instead. */
  minSize: number;
  /** Text style at a given size. */
  styleAt: (size: number) => TextStyle;
  /** Space above every line after the first, as a fraction of the size. */
  gap?: number;
  align?: 'left' | 'center';
  /** Renders a line's content, e.g. to mark the feet; plain text by default. */
  renderLine?: (line: string) => React.ReactNode;
  selectable?: boolean;
}

// Text width isn't perfectly proportional to size (hinting, rounding), so leave a little room
const SAFETY = 0.96;

/**
 * Sets each line on a single line, the way the couplet is printed, by using one
 * shared size small enough for the longest line to fit. The natural widths are
 * measured offscreen at the largest size. If the lines would need to go below
 * `minSize` (a very narrow screen or a large text setting) they keep `minSize`
 * and wrap, so the text never becomes too small to read.
 */
export const FitLines: React.FC<FitLinesProps> = ({
  lines,
  maxSize,
  minSize,
  styleAt,
  gap = 0.35,
  align = 'left',
  renderLine = (line) => line,
  selectable = false,
}) => {
  const [available, setAvailable] = useState(0);
  const [widths, setWidths] = useState<Record<number, number>>({});
  const key = `${maxSize}|${lines.join('|')}`;
  const [measuredKey, setMeasuredKey] = useState(key);

  // Lines or size changed: forget the old measurements
  if (measuredKey !== key) {
    setMeasuredKey(key);
    setWidths({});
  }

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    setAvailable(e.nativeEvent.layout.width);
  }, []);

  const widest = lines.every((_, i) => widths[i] > 0) ? Math.max(...lines.map((_, i) => widths[i])) : 0;
  const fitted = available > 0 && widest > 0 ? (maxSize * available * SAFETY) / widest : maxSize;
  const size = Math.max(minSize, Math.min(maxSize, Math.floor(fitted * 2) / 2));

  return (
    <View onLayout={onContainerLayout} style={styles.container}>
      {lines.map((line, i) => (
        <Text
          key={i}
          style={[styleAt(size), { textAlign: align }, i > 0 && { marginTop: Math.round(size * gap) }]}
          selectable={selectable}
        >
          {renderLine(line)}
        </Text>
      ))}

      {/* Offscreen measurement at the largest size, never wrapped */}
      <View style={styles.measure} pointerEvents="none" aria-hidden importantForAccessibility="no-hide-descendants">
        {lines.map((line, i) => (
          <Text
            key={`${key}-${i}`}
            style={[styleAt(maxSize), styles.measureText]}
            numberOfLines={1}
            onLayout={(e) => {
              const width = e.nativeEvent.layout.width;
              setWidths((prev) => (prev[i] === width ? prev : { ...prev, [i]: width }));
            }}
          >
            {renderLine(line)}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Keeps the wide measuring view from widening the page (web)
  container: {
    overflow: 'hidden',
  },
  measure: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4000,
    opacity: 0,
    alignItems: 'flex-start',
  },
  measureText: {
    alignSelf: 'flex-start',
  },
});
