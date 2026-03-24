import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { VButton, VInput } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing } from '../../src/theme/tokens';
import { useProfileStore } from '../../src/stores/profile';

export default function AftScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const profile = useProfileStore();
  const [acftTotal, setAcftTotal] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | null>(null);
  const [ageBracket, setAgeBracket] = useState<'17-21' | '22-26' | '27-31' | null>(null);
  const [error, setError] = useState('');
  const styles = useMemo(() => makeStyles(colors), [colors]);

  async function handleNext() {
    if (!gender) {
      setError('Please select your gender for ACFT scoring tables.');
      return;
    }
    if (!ageBracket) {
      setError('Please select your age bracket.');
      return;
    }

    const total = parseFloat(acftTotal);
    if (acftTotal && (isNaN(total) || total < 0 || total > 600)) {
      setError('ACFT total must be between 0 and 600.');
      return;
    }

    setError('');
    try {
      await profile.updateProfile({ gender, ageBracket });
    } catch (err) {
      console.warn('Failed to save AFT info:', err);
    }
    router.push('/onboarding/leadership');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Step Indicator */}
        <View style={staticStyles.steps}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              style={[styles.dot, step === 3 && styles.dotActive]}
              accessibilityLabel={`Step ${step} of 5${step === 3 ? ', current' : ''}`}
            />
          ))}
        </View>

        <Text style={styles.prompt} accessibilityRole="header">
          Fitness Profile
        </Text>

        {/* Gender Selection */}
        <Text style={styles.label}>Gender (for ACFT scoring)</Text>
        <View style={staticStyles.optionRow}>
          <VButton
            label="Male"
            onPress={() => { setGender('M'); setError(''); }}
            variant={gender === 'M' ? 'primary' : 'secondary'}
            style={staticStyles.optionButton}
            accessibilityLabel={`Male${gender === 'M' ? ', selected' : ''}`}
          />
          <VButton
            label="Female"
            onPress={() => { setGender('F'); setError(''); }}
            variant={gender === 'F' ? 'primary' : 'secondary'}
            style={staticStyles.optionButton}
            accessibilityLabel={`Female${gender === 'F' ? ', selected' : ''}`}
          />
        </View>

        {/* Age Bracket */}
        <Text style={styles.label}>Age Bracket</Text>
        <View style={staticStyles.optionRow}>
          {(['17-21', '22-26', '27-31'] as const).map((bracket) => (
            <VButton
              key={bracket}
              label={bracket}
              onPress={() => { setAgeBracket(bracket); setError(''); }}
              variant={ageBracket === bracket ? 'primary' : 'secondary'}
              style={staticStyles.bracketButton}
              accessibilityLabel={`Age ${bracket}${ageBracket === bracket ? ', selected' : ''}`}
            />
          ))}
        </View>

        {/* ACFT Total (optional) */}
        <VInput
          label="ACFT Total Score (optional)"
          value={acftTotal}
          onChangeText={(v) => { setAcftTotal(v); setError(''); }}
          placeholder="480"
          keyboardType="numeric"
          helperText="Enter your most recent ACFT total (0-600). You can add details later."
          error={!!error}
          errorText={error}
          style={staticStyles.acftInput}
          accessibilityLabel="ACFT total score input, optional"
        />

        <VButton
          label="Next"
          onPress={handleNext}
          disabled={!gender || !ageBracket}
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
  optionRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  optionButton: {
    flex: 1,
    minHeight: 48,
  },
  bracketButton: {
    flex: 1,
    minHeight: 48,
  },
  acftInput: {
    marginTop: spacing[4],
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
      marginBottom: spacing[6],
    },
    label: {
      ...typography.label_lg,
      color: colors.on_surface,
      marginBottom: spacing[2],
      marginTop: spacing[4],
    },
  });
}
