import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VButton } from '../../src/components';
import { colors, typography, spacing, roundness, elevation } from '../../src/theme/tokens';
import { useProfileStore } from '../../src/stores/useProfileStore';

const YEAR_GROUPS = [
  { key: 'MSI', label: 'MS I', subtitle: 'Freshman' },
  { key: 'MSII', label: 'MS II', subtitle: 'Sophomore' },
  { key: 'MSIII', label: 'MS III', subtitle: 'Junior' },
  { key: 'MSIV', label: 'MS IV', subtitle: 'Senior' },
] as const;

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={stepStyles.container} accessibilityLabel={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[stepStyles.dot, i + 1 === current && stepStyles.activeDot]} />
      ))}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.outlineVariant },
  activeDot: { backgroundColor: colors.primary, width: 24 },
});

export default function YearGroupScreen() {
  const router = useRouter();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [selected, setSelected] = useState<string>('MSIII');

  const handleNext = async () => {
    await updateProfile({ yearGroup: selected as 'MSI' | 'MSII' | 'MSIII' | 'MSIV' });
    router.push('/onboarding/gpa');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What year are you?</Text>

        <View style={styles.options}>
          {YEAR_GROUPS.map((yg) => {
            const isSelected = selected === yg.key;
            const isHighlight = yg.key === 'MSIII';
            return (
              <Pressable
                key={yg.key}
                onPress={() => setSelected(yg.key)}
                accessibilityLabel={`${yg.label} ${yg.subtitle}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.option,
                  isSelected && styles.optionSelected,
                  isHighlight && !isSelected && styles.optionHighlight,
                ]}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {yg.label}
                </Text>
                <Text style={[styles.optionSubtitle, isSelected && styles.optionSubtitleSelected]}>
                  {yg.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <StepDots current={2} total={6} />
          <VButton
            title="Next"
            onPress={handleNext}
            variant="filled"
            style={styles.button}
            accessibilityLabel="Continue to GPA"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  options: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm + 4,
  },
  option: {
    padding: spacing.lg,
    borderRadius: roundness.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    minHeight: 44,
  },
  optionSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
    ...elevation.level1,
  },
  optionHighlight: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  optionLabel: {
    ...typography.titleMedium,
    color: colors.onSurface,
  },
  optionLabelSelected: {
    color: colors.onPrimaryContainer,
    fontWeight: '600',
  },
  optionSubtitle: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  optionSubtitleSelected: {
    color: colors.onPrimaryContainer,
  },
  footer: {
    paddingTop: spacing.lg,
  },
  button: {
    width: '100%',
  },
});
