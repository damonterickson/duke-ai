import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { initDatabase, initKVCache, getOnboardingComplete } from '../src/services/storage';
import { useProfileStore } from '../src/stores/profile';
import { useScoresStore } from '../src/stores/scores';
import { useConversationsStore } from '../src/stores/conversations';
import { useGoalsStore } from '../src/stores/goals';
import { useThemeStore } from '../src/stores/theme';
import { useEngagementStore } from '../src/stores/engagement';
import { useSquadStore } from '../src/stores/squad';

function AppContent() {
  const { colors } = useTheme();
  const [dbReady, setDbReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  const profileLoaded = useProfileStore((s) => s.isLoaded);
  const loadProfile = useProfileStore((s) => s.loadFromSQLite);
  const loadScores = useScoresStore((s) => s.loadFromSQLite);
  const loadConversations = useConversationsStore((s) => s.loadFromSQLite);
  const loadGoals = useGoalsStore((s) => s.loadFromSQLite);
  const hydrateEngagement = useEngagementStore((s) => s.hydrate);
  const hydrateSquad = useSquadStore((s) => s.hydrate);

  // Initialize storage on mount
  useEffect(() => {
    async function init() {
      try {
        await initKVCache();

        if (Platform.OS === 'web') {
          await Promise.race([
            initDatabase(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB init timeout')), 3000)),
          ]);
        } else {
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
            Promise.all([
              loadProfile(), loadScores(), loadConversations(), loadGoals(),
              hydrateEngagement(), hydrateSquad(),
            ]),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Hydration timeout')), 3000)),
          ]);
        } else {
          await Promise.all([
            loadProfile(), loadScores(), loadConversations(), loadGoals(),
            hydrateEngagement(), hydrateSquad(),
          ]);
        }
      } catch (error) {
        console.warn('Store hydration failed:', error);
        useProfileStore.setState({ isLoaded: true });
      }
    }
    hydrate();
  }, [dbReady, loadProfile, loadScores, loadConversations, loadGoals, hydrateEngagement, hydrateSquad]);

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

  // Update engagement streak on app open
  useEffect(() => {
    if (!dbReady || !profileLoaded) return;
    useEngagementStore.getState().updateStreak();
  }, [dbReady, profileLoaded]);

  if (!dbReady || !profileLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
