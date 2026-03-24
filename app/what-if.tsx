import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  VCard,
  VButton,
  VInput,
  VMetricCard,
} from '../src/components';
import { useTheme } from '../src/theme/ThemeProvider';
import { typography, spacing } from '../src/theme/tokens';
import { useScoresStore } from '../src/stores/scores';
import { useProfileStore } from '../src/stores/profile';

export default function WhatIfScreen() {
  const router = useRouter();
  const { colors, isDark, glass } = useTheme();
  const scores = useScoresStore();
  const profile = useProfileStore();

  const latestScore = scores.scoreHistory[0];
  const currentOml = latestScore?.total_oml ?? 0;
  const currentGpa = latestScore?.gpa ?? 0;
  const currentAcft = latestScore?.acft_total ?? 0;
  const currentLeadership = latestScore?.leadership_eval ?? 0;

  const [whatIfGpa, setWhatIfGpa] = useState(String(currentGpa || '3.50'));
  const [whatIfAcft, setWhatIfAcft] = useState(String(currentAcft || '480'));
  const [whatIfLeadership, setWhatIfLeadership] = useState(
    String(currentLeadership || '85'),
  );

  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Simple OML estimation (proportional to pillar weights)
  const projectedOml = useMemo(() => {
    const gpa = parseFloat(whatIfGpa) || 0;
    const acft = parseFloat(whatIfAcft) || 0;
    const lead = parseFloat(whatIfLeadership) || 0;

    // Academic: 40% of 1000 = 400 max, scaled by GPA/4.0
    const academic = (Math.min(gpa, 4.0) / 4.0) * 400;
    // Physical: 20% of 1000 = 200 max, scaled by ACFT/600
    const physical = (Math.min(acft, 600) / 600) * 200;
    // Leadership: 40% of 1000 = 400 max, scaled by eval/100
    const leadership = (Math.min(lead, 100) / 100) * 400;

    return Math.round(academic + physical + leadership);
  }, [whatIfGpa, whatIfAcft, whatIfLeadership]);

  const delta = projectedOml - Math.round(currentOml);
  const deltaSign = delta >= 0 ? '+' : '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={staticStyles.headerRow}>
          <Text style={styles.header} accessibilityRole="header">
            What-If Simulator
          </Text>
          <VButton
            label="Close"
            onPress={() => router.back()}
            variant="tertiary"
            accessibilityLabel="Close what-if simulator"
          />
        </View>

        <Text style={styles.subtitle}>
          Adjust your scores to see how changes would impact your OML.
        </Text>

        {/* Projection */}
        <View style={staticStyles.projectionRow}>
          <VMetricCard
            value={String(projectedOml)}
            label="Projected OML"
            style={staticStyles.projectionCard}
            accessibilityLabel={`Projected OML: ${projectedOml}`}
          />
          {delta !== 0 && (
            <VCard
              tier={delta > 0 ? 'low' : 'high'}
              style={staticStyles.deltaCard}
              accessibilityLabel={`Change: ${deltaSign}${delta} OML points`}
            >
              <Text
                style={[
                  styles.deltaText,
                  { color: delta > 0 ? colors.tertiary : colors.error },
                ]}
              >
                {deltaSign}{delta}
              </Text>
              <Text style={styles.deltaLabel}>OML points</Text>
            </VCard>
          )}
        </View>

        {/* Sliders / Inputs */}
        <Text style={styles.sectionTitle}>Adjust Variables</Text>

        <VCard tier="low" style={staticStyles.inputCard}>
          <VInput
            label={`GPA (Current: ${currentGpa.toFixed(2)})`}
            value={whatIfGpa}
            onChangeText={setWhatIfGpa}
            placeholder="3.50"
            keyboardType="decimal-pad"
            accessibilityLabel={`What-if GPA. Current: ${currentGpa.toFixed(2)}`}
          />
        </VCard>

        <VCard tier="low" style={staticStyles.inputCard}>
          <VInput
            label={`ACFT Total (Current: ${Math.round(currentAcft)})`}
            value={whatIfAcft}
            onChangeText={setWhatIfAcft}
            placeholder="480"
            keyboardType="numeric"
            accessibilityLabel={`What-if ACFT total. Current: ${Math.round(currentAcft)}`}
          />
        </VCard>

        <VCard tier="low" style={staticStyles.inputCard}>
          <VInput
            label={`Leadership Eval (Current: ${Math.round(currentLeadership)})`}
            value={whatIfLeadership}
            onChangeText={setWhatIfLeadership}
            placeholder="85"
            keyboardType="numeric"
            accessibilityLabel={`What-if leadership evaluation. Current: ${Math.round(currentLeadership)}`}
          />
        </VCard>

        {/* Goal comparison */}
        {profile.goalOml != null && (
          <VCard tier="high" style={staticStyles.goalCard}>
            <Text style={styles.goalTitle}>
              Target: {Math.round(profile.goalOml)} OML
            </Text>
            <Text style={styles.goalDesc}>
              {projectedOml >= profile.goalOml
                ? 'This scenario meets your target!'
                : `${Math.round(profile.goalOml - projectedOml)} points short of your target.`}
            </Text>
          </VCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Static styles (no color dependencies)
const staticStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
  projectionRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  projectionCard: {
    flex: 2,
  },
  deltaCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputCard: {
    marginBottom: spacing[3],
  },
  goalCard: {
    marginTop: spacing[4],
  },
});

// Theme-dependent styles
function makeStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
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
    header: {
      ...typography.headline_lg,
      color: colors.on_surface,
    },
    subtitle: {
      ...typography.body_md,
      color: colors.outline,
      marginBottom: spacing[4],
    },
    deltaText: {
      ...typography.headline_md,
    },
    deltaLabel: {
      ...typography.label_sm,
      color: colors.outline,
    },
    sectionTitle: {
      ...typography.title_md,
      color: colors.on_surface,
      marginBottom: spacing[3],
    },
    goalTitle: {
      ...typography.title_sm,
      color: colors.tertiary,
      marginBottom: spacing[1],
    },
    goalDesc: {
      ...typography.body_sm,
      color: colors.on_surface,
    },
  });
}
