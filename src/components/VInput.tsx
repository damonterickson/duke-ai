import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, typography, spacing, roundness, ghostBorder } from '../theme/tokens';

export interface VInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export const VInput: React.FC<VInputProps> = ({
  label,
  helperText,
  error = false,
  errorText,
  style,
  accessibilityLabel,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
        placeholderTextColor={colors.outline}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="text"
      />
      {error && errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[1],
  },
  label: {
    ...typography.label_md,
    color: colors.on_surface,
    marginBottom: spacing[1],
  },
  input: {
    backgroundColor: colors.surface_container_low,
    borderRadius: roundness.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    ...typography.body_md,
    color: colors.on_surface,
    // Ghost border invisible at rest
    borderWidth: ghostBorder.width,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: ghostBorder.color, // outline_variant at 20% opacity
  },
  inputError: {
    borderColor: colors.error,
  },
  helperText: {
    ...typography.body_sm,
    color: colors.outline,
  },
  errorText: {
    ...typography.body_sm,
    color: colors.error,
  },
});
