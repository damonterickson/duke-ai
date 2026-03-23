import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { typography, spacing, roundness } from '../theme/tokens';

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
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface_container_high,
          borderLeftColor: colors.primary,
        },
        style,
      ]}
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
        <Text style={[styles.label, { color: colors.outline_accessible ?? colors.outline }]}>
          {label.toUpperCase()}
        </Text>
        <Text style={[styles.text, { color: colors.on_surface }]}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
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
  },
  text: {
    fontFamily: typography.body_md.fontFamily,
    fontSize: typography.body_md.fontSize,
    fontWeight: '400',
    lineHeight: 20,
  },
});
