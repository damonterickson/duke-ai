import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { VButton, VInput } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing } from '../../src/theme/tokens';
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
  const { colors } = useTheme();
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [selected, setSelected] = useState<string | null>(null);
  const [goalOml, setGoalOml] = useState('');
  const styles = useMemo(() => makeStyles(colors), [colors]);

  async function handleFinish() {
    try {
      await updateProfile({
        targetBranch: selected,
        goalOml: goalOml ? parseFloat(goalOml) : null,
      });
    } catch (err) {
      console.warn('Failed to save branch info:', err);
    }
    setOnboardingComplete(true);
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={staticStyles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator */}
        <View style={staticStyles.steps}>
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

        <View style={staticStyles.branches}>
          {POPULAR_BRANCHES.map((branch) => (
            <VButton
              key={branch}
              label={branch}
              onPress={() => setSelected(branch)}
              variant={selected === branch ? 'primary' : 'secondary'}
              style={staticStyles.branchButton}
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
          style={staticStyles.goalInput}
          accessibilityLabel="Target OML score input, optional"
        />
      </ScrollView>

      <View style={staticStyles.footer}>
        <VButton
          label="Finish Setup"
          onPress={handleFinish}
          style={staticStyles.finishButton}
          accessibilityLabel="Complete onboarding and go to app"
        />
      </View>
    </SafeAreaView>
  );
}

const staticStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  steps: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[8],
    justifyContent: 'center',
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

function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      paddingHorizontal: spacing[8],
      paddingTop: spacing[12],
      paddingBottom: spacing[4],
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
  });
}
