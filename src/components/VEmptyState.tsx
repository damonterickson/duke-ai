import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';
import { VButton } from './VButton';

export interface VEmptyStateProps {
  icon: string;
  headline: string;
  body: string;
  ctaLabel: string;
  onCtaPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const VEmptyState: React.FC<VEmptyStateProps> = ({
  icon,
  headline,
  body,
  ctaLabel,
  onCtaPress,
  style,
  accessibilityLabel,
}) => {
  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={accessibilityLabel ?? headline}
      accessibilityRole="summary"
    >
      {/* Icon with tertiary gold + subtle glow */}
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.body}>{body}</Text>

      <VButton
        label={ctaLabel}
        onPress={onCtaPress}
        variant="primary"
        style={styles.cta}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    gap: spacing[3],
  },
  iconWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
    // Subtle gold glow via shadow
    shadowColor: colors.tertiary_container,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 0,
  },
  icon: {
    fontSize: 64,
    color: colors.tertiary,
  },
  headline: {
    ...typography.headline_sm,
    color: colors.on_surface,
    textAlign: 'center',
  },
  body: {
    ...typography.body_md,
    color: colors.outline,
    textAlign: 'center',
  },
  cta: {
    marginTop: spacing[4],
    minWidth: 200,
  },
});
