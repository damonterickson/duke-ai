import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VButton, VInput } from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import { useScoresStore } from '../../src/stores/useScoresStore';

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

export default function LeadershipOnboardingScreen() {
  const router = useRouter();
  const addRole = useScoresStore((s) => s.addRole);
  const [roleTitle, setRoleTitle] = useState('');

  const handleNext = async () => {
    if (roleTitle.trim()) {
      await addRole({
        id: `role_${Date.now()}`,
        title: roleTitle.trim(),
        unit: '',
        startDate: new Date().toISOString().split('T')[0],
        active: true,
        points: 10,
      });
    }
    router.push('/onboarding/branch');
  };

  const handleSkip = () => {
    router.push('/onboarding/branch');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Any leadership roles?</Text>
        <Text style={styles.subtitle}>Optional — you can add more later</Text>

        <View style={styles.inputWrapper}>
          <VInput
            label="Current Role (optional)"
            value={roleTitle}
            onChangeText={setRoleTitle}
            placeholder="e.g. Squad Leader"
            accessibilityLabel="Enter your leadership role"
          />
        </View>

        <View style={styles.footer}>
          <StepDots current={5} total={6} />
          <VButton
            title="Next"
            onPress={handleNext}
            variant="filled"
            style={styles.button}
            accessibilityLabel="Continue to branch selection"
          />
          <VButton
            title="Skip for now"
            onPress={handleSkip}
            variant="text"
            style={styles.skipButton}
            accessibilityLabel="Skip leadership entry"
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingTop: spacing.lg,
  },
  button: {
    width: '100%',
  },
  skipButton: {
    width: '100%',
    marginTop: spacing.sm,
  },
});
