import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { VButton, VInput } from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';

export default function LeadershipOnboardingScreen() {
  const router = useRouter();
  const [leadershipEval, setLeadershipEval] = useState('');
  const [error, setError] = useState('');

  function handleNext() {
    if (leadershipEval) {
      const val = parseFloat(leadershipEval);
      if (isNaN(val) || val < 0 || val > 100) {
        setError('Leadership evaluation must be between 0 and 100.');
        return;
      }
    }
    setError('');
    router.push('/onboarding/branch');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Step Indicator */}
        <View style={styles.steps}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              style={[styles.dot, step === 4 && styles.dotActive]}
              accessibilityLabel={`Step ${step} of 5${step === 4 ? ', current' : ''}`}
            />
          ))}
        </View>

        <Text style={styles.prompt} accessibilityRole="header">
          Leadership Evaluation
        </Text>

        <VInput
          label="Commander's Assessment Score (optional)"
          value={leadershipEval}
          onChangeText={(v) => { setLeadershipEval(v); setError(''); }}
          placeholder="85"
          keyboardType="numeric"
          helperText="Your most recent commander's assessment (0-100). You can add this later if you don't have it handy."
          error={!!error}
          errorText={error}
          accessibilityLabel="Commander's assessment score input, optional"
        />

        <Text style={styles.hint}>
          Don't worry if you don't have this yet. You can log leadership
          activities, command roles, and extracurriculars in detail after setup.
        </Text>

        <VButton
          label="Next"
          onPress={handleNext}
          style={styles.nextButton}
          accessibilityLabel="Continue to next step"
        />
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
    paddingHorizontal: spacing[8],
    paddingTop: spacing[12],
  },
  steps: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[8],
    justifyContent: 'center',
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
    marginBottom: spacing[6],
  },
  hint: {
    ...typography.body_md,
    color: colors.outline,
    marginTop: spacing[6],
  },
  nextButton: {
    marginTop: 'auto' as unknown as number,
    marginBottom: spacing[8],
  },
});
