import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { VButton, VInput } from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import { useProfileStore } from '../../src/stores/profile';
import { setOnboardingComplete } from '../../src/services/storage';

const POPULAR_BRANCHES = [
  'Infantry',
  'Armor',
  'Aviation',
  'Engineer',
  'Signal',
  'Military Intelligence',
  'Medical Service',
  'Finance',
  'Quartermaster',
  'Transportation',
];

export default function BranchScreen() {
  const router = useRouter();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [selected, setSelected] = useState<string | null>(null);
  const [goalOml, setGoalOml] = useState('');

  async function handleFinish() {
    await updateProfile({
      targetBranch: selected,
      goalOml: goalOml ? parseFloat(goalOml) : null,
    });
    setOnboardingComplete(true);
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator */}
        <View style={styles.steps}>
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              style={[styles.dot, step === 5 && styles.dotActive]}
              accessibilityLabel={`Step ${step} of 5${step === 5 ? ', current' : ''}`}
            />
          ))}
        </View>

        <Text style={styles.prompt} accessibilityRole="header">
          Target Branch
        </Text>
        <Text style={styles.subtitle}>
          Which branch are you hoping for? This helps Vanguard AI tailor its
          advice.
        </Text>

        <View style={styles.branches}>
          {POPULAR_BRANCHES.map((branch) => (
            <VButton
              key={branch}
              label={branch}
              onPress={() => setSelected(branch)}
              variant={selected === branch ? 'primary' : 'secondary'}
              style={styles.branchButton}
              accessibilityLabel={`${branch}${selected === branch ? ', selected' : ''}`}
            />
          ))}
        </View>

        <VInput
          label="Target OML Score (optional)"
          value={goalOml}
          onChangeText={setGoalOml}
          placeholder="700"
          keyboardType="numeric"
          helperText="Set a goal OML score to track progress against."
          style={styles.goalInput}
          accessibilityLabel="Target OML score input, optional"
        />
      </ScrollView>

      <View style={styles.footer}>
        <VButton
          label="Finish Setup"
          onPress={handleFinish}
          style={styles.finishButton}
          accessibilityLabel="Complete onboarding and go to app"
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[8],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
  },
  steps: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[8],
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outline_variant,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  prompt: {
    ...typography.display_sm,
    color: colors.on_surface,
    marginBottom: spacing[2],
  },
  subtitle: {
    ...typography.body_md,
    color: colors.outline,
    marginBottom: spacing[6],
  },
  branches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  branchButton: {
    paddingHorizontal: spacing[4],
  },
  goalInput: {
    marginTop: spacing[2],
  },
  footer: {
    paddingHorizontal: spacing[8],
    paddingBottom: spacing[8],
  },
  finishButton: {
    width: '100%',
  },
});
