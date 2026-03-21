import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { glass, roundness, spacing } from '../theme/tokens';

export interface VGlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const VGlassPanel: React.FC<VGlassPanelProps> = ({
  children,
  style,
  accessibilityLabel,
}) => {
  return (
    <View style={[styles.container, style]} accessibilityLabel={accessibilityLabel}>
      <BlurView
        intensity={glass.blurIntensity}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: roundness.xl,
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: glass.overlayColor,
  },
  content: {
    padding: spacing[4],
  },
});
