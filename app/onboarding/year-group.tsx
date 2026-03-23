import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { VButton } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing } from '../../src/theme/tokens';
import { useProfileStore } from '../../src/stores/profile';

const YEAR_GROUPS = ['MSI', 'MSII', 'MSIII', 'MSIV'] as const;

export default function YearGroupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [selected, setSelected] = useState<typeof YEAR_GROUPS[number] | null>(null);
  const styles = useMemo(() => makeStyles(colors), [colors]);

  async function handleNext() {
    if (!selected) return;
    try {
      await updateProfile({ yearGroup: selected });
    } catch (error) {
      console.warn('Failed to save year group:', error);
    }
    router.push('/onboarding/gpa');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Step Indicator */}
        <View style={staticStyles.steps}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              style={[styles.dot, step === 1 && styles.dotActive]}
              accessibilityLabel={`Step ${step} of 5${step === 1 ? ', current' : ''}`}
            />
          ))}
        </View>

        <Text style={styles.prompt} accessibilityRole="header">
          What year are you?
        </Text>

        <View style={staticStyles.options}>
          {YEAR_GROUPS.map((yg) => (
            <VButton
              key={yg}
              label={yg}
              onPress={() => setSelected(yg)}
              variant={selected === yg ? 'primary' : 'secondary'}
              style={staticStyles.option}
              accessibilityLabel={`${yg}${selected === yg ? ', selected' : ''}`}
            />
          ))}
        </View>

        <VButton
          label="Next"
          onPress={handleNext}
          disabled={!selected}
          style={staticStyles.nextButton}
          accessibilityLabel="Continue to next step"
        />
      </View>
    </SafeAreaView>
  );
}

const staticStyles = StyleSheet.create({
  steps: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[8],
    justifyContent: 'center',
  },
  options: {
    gap: spacing[3],
    marginBottom: spacing[8],
  },
  option: {
    minHeight: 56,
  },
  nextButton: {
    marginTop: 'auto' as unknown as number,
    marginBottom: spacing[8],
  },
});

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing[8],
      paddingTop: spacing[12],
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.outline_variant,
    },
    dotActive: {
      backgroundColor: colors.primary,
      width: 24,
    },
    prompt: {
      ...typography.display_sm,
      color: colors.on_surface,
      marginBottom: spacing[8],
    },
  });
}
