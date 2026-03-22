import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { VButton, VInput } from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import { useScoresStore } from '../../src/stores/scores';

export default function GpaScreen() {
  const router = useRouter();
  const addScoreEntry = useScoresStore((s) => s.addScoreEntry);
  const [gpa, setGpa] = useState('');
  const [mslGpa, setMslGpa] = useState('');
  const [error, setError] = useState('');

  async function handleNext() {
    const gpaNum = parseFloat(gpa);
    const mslNum = parseFloat(mslGpa || gpa); // Default MSL GPA to GPA if empty

    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      setError('Please enter a valid GPA between 0.0 and 4.0.');
      return;
    }
    if (mslGpa && (isNaN(mslNum) || mslNum < 0 || mslNum > 4.0)) {
      setError('Please enter a valid MSL GPA between 0.0 and 4.0.');
      return;
    }

    setError('');
    try {
      await addScoreEntry({
        gpa: gpaNum,
        msl_gpa: mslNum,
        acft_total: null,
        leadership_eval: null,
        cst_score: null,
        clc_score: null,
        total_oml: null,
      });
    } catch (err) {
      console.warn('Failed to save GPA:', err);
    }
    router.push('/onboarding/aft');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Step Indicator */}
        <View style={styles.steps}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              style={[styles.dot, step === 2 && styles.dotActive]}
              accessibilityLabel={`Step ${step} of 5${step === 2 ? ', current' : ''}`}
            />
          ))}
        </View>

        <Text style={styles.prompt} accessibilityRole="header">
          What's your GPA?
        </Text>

        <VInput
          label="Cumulative GPA"
          value={gpa}
          onChangeText={(v) => {
            setGpa(v);
            setError('');
          }}
          placeholder="3.50"
          keyboardType="decimal-pad"
          error={!!error}
          errorText={error}
          accessibilityLabel="Cumulative GPA input"
        />

        <VInput
          label="MSL GPA (optional)"
          value={mslGpa}
          onChangeText={setMslGpa}
          placeholder="3.80"
          keyboardType="decimal-pad"
          helperText="Military Science GPA. Leave blank to use your cumulative GPA."
          style={styles.secondInput}
          accessibilityLabel="Military Science GPA input, optional"
        />

        <VButton
          label="Next"
          onPress={handleNext}
          disabled={!gpa.trim()}
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
    marginBottom: spacing[8],
  },
  secondInput: {
    marginTop: spacing[4],
  },
  nextButton: {
    marginTop: 'auto' as unknown as number,
    marginBottom: spacing[8],
  },
});
