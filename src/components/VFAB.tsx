import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, roundness, spacing } from '../theme/tokens';

export interface VFABProps {
  /** Icon character or emoji — swap for vector icon later */
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const VFAB: React.FC<VFABProps> = ({
  icon,
  onPress,
  style,
  accessibilityLabel,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? 'Action button'}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.wrapper,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <LinearGradient
        colors={gradients.primaryCta.colors as unknown as [string, string]}
        start={gradients.primaryCta.start}
        end={gradients.primaryCta.end}
        style={styles.fab}
      >
        <Text style={styles.icon}>{icon}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: spacing[8],
    right: spacing[4],
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: roundness.xl, // 12px — no rounded-full (Rule 6)
    alignItems: 'center',
    justifyContent: 'center',
    // Elevation shadow
    shadowColor: colors.on_surface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    fontSize: 24,
    color: colors.on_primary,
  },
});
