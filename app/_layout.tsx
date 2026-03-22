import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { initDatabase, initKVCache, getOnboardingComplete } from '../src/services/storage';
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

  // Initialize storage on mount
  useEffect(() => {
    async function init() {
      try {
        await initKVCache();

        if (Platform.OS === 'web') {
          // SQLite doesn't work on web — skip with timeout
          await Promise.race([
            initDatabase(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB init timeout')), 3000)),
          ]);
        } else {
          // On native, just await normally — no timeout needed
          await initDatabase();
        }
        setDbReady(true);
      } catch (error) {
        console.warn('Database init failed:', error);
        setDbReady(true);
      }
    }
    init();
  }, []);

  // Hydrate stores once DB is ready
  useEffect(() => {
    if (!dbReady) return;
    async function hydrate() {
      try {
        if (Platform.OS === 'web') {
          await Promise.race([
            Promise.all([loadProfile(), loadScores(), loadConversations()]),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Hydration timeout')), 3000)),
          ]);
        } else {
          await Promise.all([loadProfile(), loadScores(), loadConversations()]);
        }
      } catch (error) {
        console.warn('Store hydration failed:', error);
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
