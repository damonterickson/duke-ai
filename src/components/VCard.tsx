import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, spacing, roundness } from '../theme/tokens';

export interface VCardProps {
  children: React.ReactNode;
  /** Surface tier for background color */
  tier?: 'lowest' | 'low' | 'default' | 'high' | 'highest';
  /** Additional style overrides */
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const tierMap: Record<NonNullable<VCardProps['tier']>, string> = {
  lowest: colors.surface_container_lowest,
  low: colors.surface_container_low,
  default: colors.surface_container,
  high: colors.surface_container_high,
  highest: colors.surface_container_highest,
};

export const VCard: React.FC<VCardProps> = ({
  children,
  tier = 'low',
  style,
  accessibilityLabel,
}) => {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: tierMap[tier] },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="summary"
    >
      {children}
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    borderRadius: roundness.lg,
    padding: spacing[4],
    // No border — Rule 1
  },
});
