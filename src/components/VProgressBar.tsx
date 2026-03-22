import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, roundness, spacing, gradients } from '../theme/tokens';

export interface VProgressBarProps {
  /** Progress value from 0 to 1 */
  progress: number;
  /** Height of the bar in pixels */
  height?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const VProgressBar: React.FC<VProgressBarProps> = ({
  progress,
  height = 8,
  style,
  accessibilityLabel,
}) => {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View
      style={[styles.track, { height }, style]}
      accessibilityLabel={accessibilityLabel ?? `Progress: ${Math.round(clampedProgress * 100)}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clampedProgress * 100),
      }}
    >
      <LinearGradient
        colors={gradients.tertiaryProgress.colors as unknown as [string, string]}
        start={gradients.tertiaryProgress.start}
        end={gradients.tertiaryProgress.end}
        style={[
          styles.fill,
          { width: `${clampedProgress * 100}%` as unknown as number, height },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surface_container_highest,
    borderRadius: roundness.sm,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: roundness.sm,
    // Subtle glow on the filled portion
    shadowColor: '#450084',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 2,
  },
});
