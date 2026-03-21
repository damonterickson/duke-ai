import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { initDatabase, getOnboardingComplete } from '../src/services/storage';
import { useProfileStore } from '../src/stores/useProfileStore';
import { useScoresStore } from '../src/stores/useScoresStore';
import { useConversationsStore } from '../src/stores/useConversationsStore';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function bootstrap() {
      try {
        await initDatabase();
        await Promise.all([
          useProfileStore.getState().loadFromSQLite(),
          useScoresStore.getState().loadFromSQLite(),
          useConversationsStore.getState().loadFromSQLite(),
        ]);
        const complete = getOnboardingComplete();
        setOnboardingComplete(complete);
      } catch (e) {
        console.error('Bootstrap failed:', e);
      } finally {
        setIsReady(true);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding/welcome');
    } else if (onboardingComplete && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isReady, onboardingComplete, segments]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="what-if"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
