import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VCard, VButton, VInput } from '../src/components';
import { colors, typography, spacing } from '../src/theme/tokens';
import { useProfileStore } from '../src/stores/profile';
import {
  getSettings,
  setSettings,
  setOnboardingComplete,
  type AppSettings,
} from '../src/services/storage';

const AI_COACH_KEY = '@iron_vanguard_ai_coach_enabled';

export default function SettingsScreen() {
  const router = useRouter();
  const profile = useProfileStore();
  const [settings, setLocalSettings] = useState<AppSettings>({});
  const [targetBranch, setTargetBranch] = useState(profile.targetBranch ?? '');
  const [goalOml, setGoalOml] = useState(
    profile.goalOml != null ? String(profile.goalOml) : '',
  );
  const [aiCoachEnabled, setAiCoachEnabled] = useState(false);

  useEffect(() => {
    setLocalSettings(getSettings());
    // Load AI Coach setting from AsyncStorage
    AsyncStorage.getItem(AI_COACH_KEY).then((value) => {
      if (value === 'true') setAiCoachEnabled(true);
    }).catch(() => {});
  }, []);

  async function handleAiCoachToggle(value: boolean) {
    setAiCoachEnabled(value);
    try {
      await AsyncStorage.setItem(AI_COACH_KEY, value ? 'true' : 'false');
    } catch {
      // Silently fail — will retry on next toggle
    }
  }

  async function handleSaveProfile() {
    const oml = goalOml ? parseFloat(goalOml) : null;
    await profile.updateProfile({
      targetBranch: targetBranch || null,
      goalOml: oml,
    });
    Alert.alert('Saved', 'Profile updated successfully.');
  }

  function handleResetOnboarding() {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again on next launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setOnboardingComplete(false);
            router.replace('/onboarding/welcome');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header} accessibilityRole="header">
            Settings
          </Text>
          <VButton
            label="Back"
            onPress={() => router.back()}
            variant="tertiary"
            accessibilityLabel="Go back"
          />
        </View>

        {/* Profile Section */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <VCard tier="low" style={styles.section}>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Year Group</Text>
            <Text style={styles.profileValue}>{profile.yearGroup ?? '--'}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Gender</Text>
            <Text style={styles.profileValue}>
              {profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : '--'}
            </Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Age Bracket</Text>
            <Text style={styles.profileValue}>{profile.ageBracket ?? '--'}</Text>
          </View>
        </VCard>

        {/* Goals Section */}
        <Text style={styles.sectionTitle}>Goals</Text>
        <VCard tier="low" style={styles.section}>
          <VInput
            label="Target Branch"
            value={targetBranch}
            onChangeText={setTargetBranch}
            placeholder="Infantry"
            accessibilityLabel="Target branch input"
          />
          <VInput
            label="Goal OML Score"
            value={goalOml}
            onChangeText={setGoalOml}
            placeholder="700"
            keyboardType="numeric"
            style={styles.goalInput}
            accessibilityLabel="Goal OML score input"
          />
          <VButton
            label="Save Goals"
            onPress={handleSaveProfile}
            variant="secondary"
            style={styles.saveButton}
            accessibilityLabel="Save profile goals"
          />
        </VCard>

        {/* AI Coach Section */}
        <Text style={styles.sectionTitle}>AI Coach</Text>
        <VCard tier="low" style={styles.section}>
          <View style={styles.aiCoachRow}>
            <View style={styles.aiCoachTextBlock}>
              <Text style={styles.aiCoachLabel}>AI Coach</Text>
              <Text style={styles.aiCoachDesc}>
                Vanguard AI will create and manage goals based on your profile
              </Text>
            </View>
            <Switch
              value={aiCoachEnabled}
              onValueChange={handleAiCoachToggle}
              trackColor={{
                false: colors.surface_container_high,
                true: colors.tertiary_container,
              }}
              thumbColor={aiCoachEnabled ? colors.tertiary : colors.outline}
              accessibilityLabel="Toggle AI Coach"
              accessibilityRole="switch"
              accessibilityState={{ checked: aiCoachEnabled }}
              style={styles.aiCoachSwitch}
            />
          </View>
          {aiCoachEnabled && (
            <Text style={styles.aiCoachActiveNote}>
              AI Coach will create goals on your next briefing. Max 5 active goals.
            </Text>
          )}
        </VCard>

        {/* App Section */}
        <Text style={styles.sectionTitle}>App</Text>
        <VCard tier="low" style={styles.section}>
          <VButton
            label="Restart Onboarding"
            onPress={handleResetOnboarding}
            variant="tertiary"
            accessibilityLabel="Restart the onboarding flow"
          />
        </VCard>

        {/* About */}
        <VCard tier="low" style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Duke Vanguard</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutDesc}>
            AI-powered OML optimizer for Army ROTC cadets. Built with care for
            every future officer.
          </Text>
        </VCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  header: {
    ...typography.headline_lg,
    color: colors.on_surface,
  },
  sectionTitle: {
    ...typography.title_md,
    color: colors.on_surface,
    marginBottom: spacing[3],
    marginTop: spacing[4],
  },
  section: {
    gap: spacing[3],
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileLabel: {
    ...typography.body_md,
    color: colors.outline,
  },
  profileValue: {
    ...typography.title_sm,
    color: colors.on_surface,
  },
  goalInput: {
    marginTop: spacing[1],
  },
  saveButton: {
    marginTop: spacing[2],
  },
  // AI Coach styles
  aiCoachRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiCoachTextBlock: {
    flex: 1,
    marginRight: spacing[3],
  },
  aiCoachLabel: {
    ...typography.title_sm,
    color: colors.on_surface,
  },
  aiCoachDesc: {
    ...typography.body_sm,
    color: colors.outline,
    marginTop: spacing[1],
  },
  aiCoachSwitch: {
    minHeight: 44,
    minWidth: 44,
  },
  aiCoachActiveNote: {
    ...typography.label_sm,
    color: colors.tertiary,
  },
  aboutCard: {
    marginTop: spacing[8],
    alignItems: 'center',
  },
  aboutTitle: {
    ...typography.title_md,
    color: colors.primary,
  },
  aboutVersion: {
    ...typography.label_sm,
    color: colors.outline,
    marginTop: spacing[1],
  },
  aboutDesc: {
    ...typography.body_sm,
    color: colors.outline,
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
