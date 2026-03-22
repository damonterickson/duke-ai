import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, roundness } from '../theme/tokens';

export interface VRankBadgeProps {
  rank: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const VRankBadge: React.FC<VRankBadgeProps> = ({
  rank,
  style,
  accessibilityLabel,
}) => {
  return (
    <View
      style={[styles.badge, style]}
      accessibilityLabel={accessibilityLabel ?? `Rank: ${rank}`}
      accessibilityRole="text"
    >
      <Text style={styles.text}>{rank}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'transparent',
    borderRadius: roundness.sm,
    borderWidth: 1,
    borderColor: 'rgba(200, 199, 184, 0.20)', // outline at 20%
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.label_md,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
