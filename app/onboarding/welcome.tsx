import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VButton } from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={stepStyles.container} accessibilityLabel={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[stepStyles.dot, i + 1 === current && stepStyles.activeDot]}
        />
      ))}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outlineVariant,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },
});

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.center}>
          <Text style={styles.wordmark}>IRON{'\n'}VANGUARD</Text>
          <Text style={styles.tagline}>Your OML Mentor</Text>
        </View>

        <View style={styles.footer}>
          <StepDots current={1} total={6} />
          <VButton
            title="Get Started"
            onPress={() => router.push('/onboarding/year-group')}
            variant="filled"
            accessibilityLabel="Get started with onboarding"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export { StepDots };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    ...typography.displayLarge,
    color: colors.primary,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 4,
    lineHeight: 68,
  },
  tagline: {
    ...typography.titleLarge,
    color: colors.onSurfaceVariant,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  footer: {
    paddingTop: spacing.lg,
  },
  button: {
    width: '100%',
  },
});
