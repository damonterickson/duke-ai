import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { roundness } from '../theme/tokens';

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
  const { colors, gradients, glowDrops } = useTheme();
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: colors.surface_container_highest },
        style,
      ]}
      accessibilityLabel={accessibilityLabel ?? `Progress: ${Math.round(clampedProgress * 100)}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clampedProgress * 100),
      }}
    >
      <LinearGradient
        colors={gradients.goldReward.colors as unknown as [string, string]}
        start={gradients.goldReward.start}
        end={gradients.goldReward.end}
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%` as unknown as number,
            height,
            ...(glowDrops.gold ?? {}),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: roundness.sm,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: roundness.sm,
  },
});
