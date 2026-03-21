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

  // Initialize database and MMKV on mount
  useEffect(() => {
    async function init() {
      try {
        initMMKV();
        await initDatabase();
        setDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setDbReady(true); // Continue anyway, with degraded functionality
      }
    }
    init();
  }, []);

  // Hydrate stores once DB is ready
  useEffect(() => {
    if (!dbReady) return;
    loadProfile();
    loadScores();
    loadConversations();
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
