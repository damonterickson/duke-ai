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

export default function AFTScreen() {
  const router = useRouter();
  const setACFTScore = useScoresStore((s) => s.setACFTScore);
  const [score, setScore] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (score.trim()) {
      const val = parseInt(score, 10);
      if (isNaN(val) || val < 0 || val > 600) {
        setError('Enter a score between 0 and 600');
        return;
      }
      setACFTScore(val);
    }
    router.push('/onboarding/leadership');
  };

  const handleSkip = () => {
    router.push('/onboarding/leadership');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your latest ACFT score?</Text>

        <View style={styles.inputWrapper}>
          <VInput
            label="ACFT Score"
            value={score}
            onChangeText={(text) => {
              setScore(text);
              setError('');
            }}
            placeholder="e.g. 520"
            keyboardType="number-pad"
            error={error}
            helper="Total score out of 600"
            accessibilityLabel="Enter your ACFT score"
            maxLength={3}
          />
        </View>

        <View style={styles.footer}>
          <StepDots current={4} total={6} />
          <VButton
            title="Next"
            onPress={handleNext}
            variant="filled"
            style={styles.button}
            accessibilityLabel="Continue to leadership"
          />
          <VButton
            title="I'll enter events later"
            onPress={handleSkip}
            variant="text"
            style={styles.skipButton}
            accessibilityLabel="Skip ACFT entry"
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
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
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
