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

export default function GPAScreen() {
  const router = useRouter();
  const setGPA = useScoresStore((s) => s.setGPA);
  const [gpa, setGpaInput] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    const val = parseFloat(gpa);
    if (isNaN(val) || val < 0 || val > 4.0) {
      setError('Enter a GPA between 0.00 and 4.00');
      return;
    }
    setGPA(val);
    router.push('/onboarding/aft');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your current GPA?</Text>

        <View style={styles.inputWrapper}>
          <VInput
            label="GPA"
            value={gpa}
            onChangeText={(text) => {
              setGpaInput(text);
              setError('');
            }}
            placeholder="e.g. 3.50"
            keyboardType="decimal-pad"
            error={error}
            helper="On a 4.00 scale"
            accessibilityLabel="Enter your GPA"
            maxLength={4}
          />
        </View>

        <View style={styles.footer}>
          <StepDots current={3} total={6} />
          <VButton
            title="Next"
            onPress={handleNext}
            variant="filled"
            style={styles.button}
            accessibilityLabel="Continue to ACFT"
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
});
