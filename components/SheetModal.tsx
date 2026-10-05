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
  height?: `${number}%`;
}

/** Bottom sheet used for all detail/settings popups. Closes on Android back and backdrop tap. */
export const SheetModal: React.FC<SheetModalProps> = ({
  visible, onClose, title, children, scrollable = true, headerRight, height = '90%',
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
          <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
            <Text variant="titleMedium" style={styles.title} numberOfLines={1}>{title}</Text>
            <View style={styles.headerActions}>
              {headerRight}
              <IconButton icon="close" onPress={onClose} accessibilityLabel="Close" />
            </View>
          </View>
          {scrollable ? (
            <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
          ) : (
            <View style={styles.flex}>{children}</View>
          )}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    paddingBottom: 20,
  },
  flex: {
    flex: 1,
  },
});
