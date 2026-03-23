import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { VButton } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing } from '../../src/theme/tokens';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
          style={staticStyles.cta}
          accessibilityLabel="Get started with onboarding"
        />
      </View>
    </SafeAreaView>
  );
}

const staticStyles = StyleSheet.create({
  cta: {
    minWidth: 240,
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
  });
}
