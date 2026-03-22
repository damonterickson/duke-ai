import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { VButton } from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.brand} accessibilityRole="header">
            Duke Vanguard
          </Text>
          <Text style={styles.tagline}>Your OML Mentor</Text>
          <Text style={styles.description}>
            Understand your OML score, discover your biggest opportunities, and
            optimize your path to your branch of choice.
          </Text>
        </View>

        <VButton
          label="Get Started"
          onPress={() => router.push('/onboarding/year-group')}
          style={styles.cta}
          accessibilityLabel="Get started with onboarding"
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing[12],
  },
  brand: {
    ...typography.display_md,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  tagline: {
    ...typography.title_lg,
    color: colors.on_surface,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  description: {
    ...typography.body_lg,
    color: colors.outline,
    textAlign: 'center',
  },
  cta: {
    minWidth: 240,
  },
});
