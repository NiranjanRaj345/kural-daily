import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing, FadeIn, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming,
} from 'react-native-reanimated';

interface SpoilerProps {
  text: string;
  style: TextStyle;
  /** Colour of the particles (the text colour). */
  color: string;
}

// Each layer drifts on its own path and timing, so together the dots shimmer
const LAYERS = [
  { dx: 2.5, dy: 1.2, duration: 1700 },
  { dx: -2, dy: 1.6, duration: 2300 },
  { dx: 1.6, dy: -1.4, duration: 2900 },
];
const BLEED = 4; // particles reach a little past the word so the drift never shows an edge

/** A small deterministic random sequence, so a word's particles don't jump on re-render. */
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) % 2147483646 + 1;
};

const Layer: React.FC<{ width: number; height: number; seed: number; color: string; index: number }> = ({
  width, height, seed, color, index,
}) => {
  const { dx, dy, duration } = LAYERS[index];
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(index * 200, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [t, duration, index]);

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateX: (t.value - 0.5) * 2 * dx }, { translateY: (t.value - 0.5) * 2 * dy }],
    opacity: 0.55 + 0.45 * Math.abs(Math.sin((t.value + index / 3) * Math.PI)),
  }));

  const dots = useMemo(() => {
    const rand = seeded(seed);
    const w = width + BLEED * 2;
    const h = height;
    // About one dot per 15 square points, shared across the layers
    const count = Math.min(260, Math.round((w * h) / 15 / LAYERS.length));
    return Array.from({ length: count }, () => ({
      x: rand() * w,
      // Denser through the middle of the line, where the letters are
      y: h * (0.18 + 0.64 * ((rand() + rand()) / 2)),
      r: 0.5 + rand() * 0.6,
      o: 0.35 + rand() * 0.6,
    }));
  }, [seed, width, height]);

  return (
    <Animated.View style={[styles.layer, { left: -BLEED, width: width + BLEED * 2, height }, animated]}>
      <Svg width={width + BLEED * 2} height={height}>
        {dots.map((d, i) => (
          <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} fillOpacity={d.o} />
        ))}
      </Svg>
    </Animated.View>
  );
};

/**
 * Hidden text shown as a cloud of drifting particles, like a spoiler in a chat
 * app. The text itself is never drawn while hidden (it only keeps the size), so
 * nothing can be read through it. To reveal, render the text in its place.
 */
export const Spoiler: React.FC<SpoilerProps> = ({ text, style, color }) => {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const seed = useMemo(() => hash(text), [text]);

  return (
    <View importantForAccessibility="no-hide-descendants">
      <Text
        style={[style, styles.invisible]}
        onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        accessibilityElementsHidden
      >
        {text}
      </Text>
      {size && (
        <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill} pointerEvents="none">
          {LAYERS.map((_, i) => (
            <Layer key={i} index={i} width={size.width} height={size.height} seed={seed + i * 7919} color={color} />
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  invisible: {
    opacity: 0,
  },
  layer: {
    position: 'absolute',
    top: 0,
  },
});
