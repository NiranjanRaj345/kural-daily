import React from 'react';
import { View, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SheetModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Wrap children in a ScrollView. Turn off when the content is its own list. */
  scrollable?: boolean;
  headerRight?: React.ReactNode;
  /** Pinned below the scrolling content. */
  footer?: React.ReactNode;
  subtitle?: string;
  /** Changing this resets the scroll position (e.g. when showing a different item). */
  contentKey?: string | number;
  height?: `${number}%`;
}

/** Bottom sheet used for all detail/settings popups. Closes on Android back and backdrop tap. */
export const SheetModal: React.FC<SheetModalProps> = ({
  visible, onClose, title, children, scrollable = true, headerRight, footer, subtitle, contentKey, height = '90%',
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.container}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.content, { height, backgroundColor: theme.colors.background, paddingBottom: insets.bottom }]}>
          <View style={[styles.grabber, { backgroundColor: theme.colors.outline }]} />
          <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
            <View style={styles.title}>
              <Text variant="titleMedium" numberOfLines={1} accessibilityRole="header">{title}</Text>
              {subtitle && (
                <Text variant="labelSmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
                  {subtitle}
                </Text>
              )}
            </View>
            <View style={styles.headerActions}>
              {headerRight}
              <IconButton icon="close" onPress={onClose} accessibilityLabel="Close" />
            </View>
          </View>
          {scrollable ? (
            <ScrollView key={contentKey} contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
          ) : (
            <View style={styles.flex}>{children}</View>
          )}
          {footer}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    opacity: 0.4,
  },
  flex: {
    flex: 1,
  },
});
