import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { roundness, spacing } from '../theme/tokens';

export interface VGlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

/**
 * Glassmorphism panel using semi-transparent backgrounds.
 * No expo-blur dependency — compatible with Expo Go.
 * Theme-aware: uses light or dark glass overlay color.
 */
export const VGlassPanel: React.FC<VGlassPanelProps> = ({
  children,
  style,
  accessibilityLabel,
}) => {
  const { glass, ghostBorder } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: glass.overlayColor,
          borderColor: ghostBorder.color,
          borderWidth: ghostBorder.width,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: roundness.xl,
    overflow: 'hidden',
    padding: spacing[4],
  },
});
