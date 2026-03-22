import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, roundness, gradients } from '../theme/tokens';

export interface VButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const VButton: React.FC<VButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
}) => {
  const content = loading ? (
    <ActivityIndicator
      color={variant === 'primary' ? colors.on_primary : colors.primary}
    />
  ) : (
    <Text
      style={[
        styles.label,
        variant === 'primary' && styles.labelPrimary,
        variant === 'secondary' && styles.labelSecondary,
        variant === 'tertiary' && styles.labelTertiary,
        disabled && styles.labelDisabled,
      ]}
    >
      {label}
    </Text>
  );

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          style,
          pressed && { opacity: 0.85 },
          disabled && { opacity: 0.5 },
        ]}
      >
        <LinearGradient
          colors={gradients.primaryCta.colors as unknown as [string, string]}
          start={gradients.primaryCta.start}
          end={gradients.primaryCta.end}
          style={styles.container}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.container,
        variant === 'secondary' && styles.secondaryBg,
        variant === 'tertiary' && styles.tertiaryBg,
        pressed && { opacity: 0.85 },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: roundness.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    // Glow Drop shadow for primary buttons
    shadowColor: '#450084',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  secondaryBg: {
    backgroundColor: colors.surface_container_low,
    // Secondary glow
    shadowColor: '#544511',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
  },
  tertiaryBg: {
    backgroundColor: 'transparent',
  },
  label: {
    ...typography.label_lg,
  } as TextStyle,
  labelPrimary: {
    color: colors.on_primary,
  },
  labelSecondary: {
    color: colors.primary,
  },
  labelTertiary: {
    color: colors.primary,
  },
  labelDisabled: {
    color: colors.outline,
  },
});
