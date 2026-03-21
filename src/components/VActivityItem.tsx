import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, roundness } from '../theme/tokens';

export interface VActivityItemProps {
  title: string;
  subtitle?: string;
  pointDelta?: number;
  timestamp?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const VActivityItem: React.FC<VActivityItemProps> = ({
  title,
  subtitle,
  pointDelta,
  timestamp,
  style,
  accessibilityLabel,
}) => {
  const deltaSign = pointDelta != null && pointDelta >= 0 ? '+' : '';
  const deltaColor = pointDelta != null && pointDelta >= 0 ? colors.primary : colors.error;

  return (
    <View
      style={[styles.item, style]}
      accessibilityLabel={
        accessibilityLabel ??
        `${title}${pointDelta != null ? `, ${deltaSign}${pointDelta} points` : ''}`
      }
      accessibilityRole="text"
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
      </View>
      {pointDelta != null && (
        <View style={[styles.badge, { backgroundColor: deltaColor + '18' }]}>
          <Text style={[styles.badgeText, { color: deltaColor }]}>
            {deltaSign}{pointDelta}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    // No dividers — spacing only (Rule 1). Parent should use gap={spacing[6]}.
  },
  content: {
    flex: 1,
    gap: spacing[1],
  },
  title: {
    ...typography.title_sm,
    color: colors.on_surface,
  },
  subtitle: {
    ...typography.body_sm,
    color: colors.outline,
  },
  timestamp: {
    ...typography.label_sm,
    color: colors.outline,
  },
  badge: {
    borderRadius: roundness.md,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    marginLeft: spacing[3],
    // No border — Rule 1
  },
  badgeText: {
    ...typography.label_md,
  },
});
