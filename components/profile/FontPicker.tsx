import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../../store/useSettingsStore';
import { READING_FONTS, buildTheme, useAppTheme, space, radius } from '../../theme';

/** Font choice, each option previewed in its own typeface. */
export const FontPicker: React.FC = () => {
  const theme = useAppTheme();
  const readingFont = useSettingsStore((s) => s.readingFont);
  const setReadingFont = useSettingsStore((s) => s.setReadingFont);

  return (
    <View style={styles.container}>
      <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>Font</Text>
      <View style={styles.options}>
        {READING_FONTS.map((f) => {
          const selected = f.value === readingFont;
          const preview = buildTheme(theme.appearance, theme.accent, f.value).type;
          return (
            <Pressable
              key={f.value}
              onPress={() => setReadingFont(f.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${f.label} font. ${f.detail}`}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.background,
                  borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.optionTop}>
                <Text style={[preview.kural(20), styles.sample, { color: selected ? theme.colors.onPrimaryContainer : theme.colors.ink }]}>
                  அகர
                </Text>
                {selected && <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.primary} />}
              </View>
              <Text style={[preview.translation, styles.sampleEnglish, { color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }]}>
                Aa
              </Text>
              <Text variant="labelMedium" style={{ color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurface }}>
                {f.label}
              </Text>
              <Text variant="labelSmall" style={{ color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }} numberOfLines={2}>
                {f.detail}
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
  options: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.sm,
  },
  option: {
    flex: 1,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 2,
  },
  optionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sample: {
    lineHeight: 30,
  },
  sampleEnglish: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: space.xs,
  },
});
