import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, roundness } from '../theme/tokens';

export interface VInsightCardProps {
  /** Material icon name */
  icon: string;
  /** Label text, e.g. "Vanguard AI Insight" */
  label: string;
  /** The recommendation / insight text */
  text: string;
  /** Optional style overrides */
  style?: ViewStyle;
}

export const VInsightCard: React.FC<VInsightCardProps> = ({
  icon,
  label,
  text,
  style,
}) => {
  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={`${label}: ${text}`}
      accessibilityRole="text"
    >
      <MaterialIcons
        name={icon as keyof typeof MaterialIcons.glyphMap}
        size={24}
        color={colors.primary}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `rgba(75, 83, 32, 0.10)`, // primary_container at 10%
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderTopRightRadius: roundness.lg,
    borderBottomRightRadius: roundness.lg,
    padding: spacing[5],
    gap: spacing[4],
  },
  icon: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: spacing[2],
  },
  label: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: typography.label_sm.fontSize,
    fontWeight: '700',
    letterSpacing: 1.5,
    lineHeight: typography.label_sm.lineHeight,
    color: colors.primary,
  },
  text: {
    fontFamily: typography.body_lg.fontFamily,
    fontSize: typography.body_lg.fontSize,
    fontWeight: '500',
    lineHeight: 22,
    color: colors.primary,
  },
});
