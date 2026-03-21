import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VButton } from '../../src/components';
import { colors, typography, spacing, roundness, elevation } from '../../src/theme/tokens';
import { useProfileStore } from '../../src/stores/useProfileStore';
import { setOnboardingComplete } from '../../src/services/storage';

const BRANCHES = [
  'Infantry',
  'Armor',
  'Field Artillery',
  'Aviation',
  'Engineer',
  'Signal',
  'Military Intelligence',
  'Military Police',
  'Chemical',
  'Transportation',
  'Ordnance',
  'Quartermaster',
  'Finance',
  'Adjutant General',
  'Medical Service',
  'Cyber',
  'Not sure yet',
];

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

export default function BranchScreen() {
  const router = useRouter();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [selected, setSelected] = useState<string>('');

  const handleFinish = async () => {
    if (selected) {
      await updateProfile({ targetBranch: selected === 'Not sure yet' ? '' : selected });
    }
    setOnboardingComplete(true);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What branch are you targeting?</Text>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.options}
          showsVerticalScrollIndicator={false}
        >
          {BRANCHES.map((branch) => {
            const isSelected = selected === branch;
            return (
              <Pressable
                key={branch}
                onPress={() => setSelected(branch)}
                accessibilityLabel={branch}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={[styles.option, isSelected && styles.optionSelected]}
              >
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {branch}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <StepDots current={6} total={6} />
          <VButton
            title="Finish Setup"
            onPress={handleFinish}
            variant="filled"
            style={styles.button}
            accessibilityLabel="Complete onboarding and enter app"
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  scrollArea: {
    flex: 1,
  },
  options: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: roundness.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    minHeight: 44,
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
    ...elevation.level1,
  },
  optionLabel: {
    ...typography.bodyLarge,
    color: colors.onSurface,
  },
  optionLabelSelected: {
    color: colors.onPrimaryContainer,
    fontWeight: '600',
  },
  footer: {
    paddingTop: spacing.md,
  },
  button: {
    width: '100%',
  },
});
