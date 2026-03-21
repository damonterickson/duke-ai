import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { initDatabase } from '../src/services/storage';
import { initMMKV, getOnboardingComplete } from '../src/services/storage';
import { useProfileStore } from '../src/stores/profile';
import { useScoresStore } from '../src/stores/scores';
import { useConversationsStore } from '../src/stores/conversations';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  const profileLoaded = useProfileStore((s) => s.isLoaded);
  const loadProfile = useProfileStore((s) => s.loadFromSQLite);
  const loadScores = useScoresStore((s) => s.loadFromSQLite);
  const loadConversations = useConversationsStore((s) => s.loadFromSQLite);

  // Initialize database and MMKV on mount (with timeout for web)
  useEffect(() => {
    async function init() {
      try {
        initMMKV();
        // Timeout after 3s to handle environments where SQLite hangs (e.g., web)
        await Promise.race([
          initDatabase(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB init timeout')), 3000)),
        ]);
        setDbReady(true);
      } catch (error) {
        console.warn('Database init failed (may be web environment):', error);
        setDbReady(true); // Continue with degraded functionality
      }
    }
    init();
  }, []);

  // Hydrate stores once DB is ready (with timeout for web)
  useEffect(() => {
    if (!dbReady) return;
    async function hydrate() {
      try {
        await Promise.race([
          Promise.all([loadProfile(), loadScores(), loadConversations()]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Hydration timeout')), 3000)),
        ]);
      } catch (error) {
        console.warn('Store hydration failed (may be web):', error);
        // Force loaded state so the app renders
        useProfileStore.setState({ isLoaded: true });
      }
    }
    hydrate();
  }, [dbReady, loadProfile, loadScores, loadConversations]);

  // Onboarding gate
  useEffect(() => {
    if (!dbReady || !profileLoaded) return;

    const onboardingComplete = getOnboardingComplete();
    const inOnboarding = segments[0] === 'onboarding';

    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding/welcome');
    } else if (onboardingComplete && inOnboarding) {
      router.replace('/');
    }
  }, [dbReady, profileLoaded, segments, router]);

  if (!dbReady || !profileLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
