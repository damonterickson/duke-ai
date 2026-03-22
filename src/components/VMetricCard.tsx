import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, roundness } from '../theme/tokens';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface VMetricCardProps {
  value: string | number;
  label: string;
  trend?: TrendDirection;
  trendLabel?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const trendArrows: Record<TrendDirection, string> = {
  up: '\u25B2',   // solid up triangle
  down: '\u25BC', // solid down triangle
  flat: '\u25C6', // diamond for flat
};

const trendColors: Record<TrendDirection, string> = {
  up: colors.tertiary,
  down: colors.error,
  flat: colors.outline,
};

export const VMetricCard: React.FC<VMetricCardProps> = ({
  value,
  label,
  trend,
  trendLabel,
  style,
  accessibilityLabel,
}) => {
  const a11yLabel =
    accessibilityLabel ??
    `${label}: ${value}${trend ? `, trending ${trend}` : ''}${trendLabel ? `, ${trendLabel}` : ''}`;

  return (
    <View
      style={[styles.card, style]}
      accessibilityLabel={a11yLabel}
      accessibilityRole="summary"
    >
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && (
        <View style={styles.trendRow}>
          <Text style={[styles.trendArrow, { color: trendColors[trend] }]}>
            {trendArrows[trend]}
          </Text>
          {trendLabel && (
            <Text style={[styles.trendLabel, { color: trendColors[trend] }]}>
              {trendLabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface_container_low,
    borderRadius: roundness.lg,
    padding: spacing[4],
    // No border — Rule 1
  },
  value: {
    ...typography.display_lg,
    color: colors.on_surface,
  },
  label: {
    ...typography.label_md,
    color: colors.outline,
    marginTop: spacing[1],
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
    gap: spacing[1],
  },
  trendArrow: {
    fontSize: 12,
  },
  trendLabel: {
    ...typography.label_sm,
  },
});
