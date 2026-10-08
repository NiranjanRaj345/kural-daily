import React from 'react';
import { View, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ACCENTS, APPEARANCES, buildTheme, resolveAppearance, useAppTheme, useType, space, radius } from '../../theme';

/** Paper colour and accent swatches, each previewed in its own colours. */
export const AppearancePicker: React.FC = () => {
  const theme = useAppTheme();
  const type = useType();
  const systemScheme = useColorScheme();
  const appearance = useSettingsStore((s) => s.appearance);
  const accent = useSettingsStore((s) => s.accent);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const setAccent = useSettingsStore((s) => s.setAccent);

  return (
    <View style={styles.container}>
      <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>Page</Text>
      <View style={styles.swatches}>
        {APPEARANCES.map((a) => {
          const preview = buildTheme(resolveAppearance(a.value, systemScheme), accent);
          const selected = a.value === appearance;
          return (
            <Pressable
              key={a.value}
              onPress={() => setAppearance(a.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${a.label} page`}
              style={styles.swatchItem}
            >
              <View
                style={[
                  styles.page,
                  {
                    backgroundColor: preview.colors.background,
                    borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                {a.value === 'auto' ? (
                  <View style={styles.autoSplit}>
                    <View style={[styles.autoHalf, { backgroundColor: buildTheme('paper', accent).colors.background }]}>
                      <Text style={[type.kural(14), styles.autoLetter, { color: buildTheme('paper', accent).colors.ink }]}>அ</Text>
                    </View>
                    <View style={[styles.autoHalf, { backgroundColor: buildTheme('night', accent).colors.background }]}>
                      <Text style={[type.kural(14), styles.autoLetter, { color: buildTheme('night', accent).colors.ink }]}>அ</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={[type.kural(22), styles.pageLetter, { color: preview.colors.ink }]}>அ</Text>
                    <View style={[styles.pageRule, { backgroundColor: preview.colors.primary }]} />
                  </>
                )}
              </View>
              <Text variant="labelSmall" style={{ color: selected ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                {a.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text variant="titleSmall" style={[styles.heading, { color: theme.colors.onSurface }]}>Accent</Text>
      <View style={styles.swatches}>
        {ACCENTS.map((c) => {
          const selected = c.value === accent;
          const { primary: colour, onPrimary } = buildTheme(theme.appearance, c.value).colors;
          return (
            <Pressable
              key={c.value}
              onPress={() => setAccent(c.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${c.label} accent`}
              style={styles.swatchItem}
            >
              <View style={[styles.ring, { borderColor: selected ? colour : 'transparent' }]}>
                <View style={[styles.dot, { backgroundColor: colour }]}>
                  {selected && <MaterialCommunityIcons name="check" size={18} color={onPrimary} />}
                </View>
              </View>
              <Text variant="labelSmall" style={{ color: selected ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  heading: {
    marginTop: space.lg,
  },
  swatches: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space.sm,
  },
  swatchItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  page: {
    width: 56,
    height: 68,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pageLetter: {
    lineHeight: 34,
  },
  autoLetter: {
    lineHeight: 24,
  },
  pageRule: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginTop: 2,
  },
  autoSplit: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    flex: 1,
  },
  autoHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    padding: 3,
    borderRadius: 26,
    borderWidth: 2,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
