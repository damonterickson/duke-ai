import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { VButton, VCard, VRankBadge } from '../src/components';
import { colors, typography, spacing, roundness } from '../src/theme/tokens';
import { useScoresStore } from '../src/stores/useScoresStore';
import { useProfileStore } from '../src/stores/useProfileStore';
import { calculateOMLQuick } from '../src/engine/oml';

// Simple slider component (no dependency needed)
function SimpleSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : `${value}`;

  const increment = () => onChange(Math.min(value + step, max));
  const decrement = () => onChange(Math.max(value - step, min));

  return (
    <View style={sliderStyles.container} accessibilityLabel={`${label}: ${display}`}>
      <View style={sliderStyles.header}>
        <Text style={sliderStyles.label}>{label}</Text>
        <Text style={sliderStyles.value}>{display}</Text>
      </View>
      <View style={sliderStyles.track}>
        <View style={[sliderStyles.fill, { width: `${pct}%` }]} />
      </View>
      <View style={sliderStyles.controls}>
        <Pressable
          onPress={decrement}
          accessibilityLabel={`Decrease ${label}`}
          accessibilityRole="button"
          style={sliderStyles.controlButton}
        >
          <MaterialIcons name="remove" size={20} color={colors.onSurface} />
        </Pressable>
        <Text style={sliderStyles.range}>
          {formatValue ? formatValue(min) : min} — {formatValue ? formatValue(max) : max}
        </Text>
        <Pressable
          onPress={increment}
          accessibilityLabel={`Increase ${label}`}
          accessibilityRole="button"
          style={sliderStyles.controlButton}
        >
          <MaterialIcons name="add" size={20} color={colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.titleSmall,
    color: colors.onSurface,
  },
  value: {
    ...typography.titleSmall,
    color: colors.primary,
    fontWeight: '600',
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: roundness.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: roundness.full,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  range: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
});

export default function WhatIfScreen() {
  const router = useRouter();
  const { academic, physical, leadership } = useScoresStore();
  const setGPA = useScoresStore((s) => s.setGPA);
  const setACFTScore = useScoresStore((s) => s.setACFTScore);
  const setLeadershipTotal = useScoresStore((s) => s.setLeadershipTotal);

  const [gpa, setGPALocal] = useState(academic.gpa || 3.0);
  const [acft, setACFTLocal] = useState(physical.totalScore || 450);
  const [lead, setLeadLocal] = useState(leadership.totalScore || 50);

  // Current scores for delta calculation
  const currentOML = useMemo(
    () => calculateOMLQuick(academic.gpa, physical.totalScore, leadership.totalScore),
    [academic.gpa, physical.totalScore, leadership.totalScore]
  );

  const simOML = useMemo(() => calculateOMLQuick(gpa, acft, lead), [gpa, acft, lead]);

  const delta = Math.round((simOML.total - currentOML.total) * 10) / 10;

  const handleApply = () => {
    setGPA(gpa);
    setACFTScore(acft);
    setLeadershipTotal(lead);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What-If Simulator</Text>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Close simulator"
            accessibilityRole="button"
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color={colors.onSurface} />
          </Pressable>
        </View>

        {/* OML Projection */}
        <VCard variant="filled" style={styles.projectionCard}>
          <View style={styles.projectionRow}>
            <View>
              <Text style={styles.projectionLabel}>Projected OML</Text>
              <Text style={styles.projectionValue}>{simOML.total}</Text>
              <Text style={styles.projectionMax}>/100</Text>
            </View>
            {delta !== 0 && (
              <VRankBadge
                label={`${delta > 0 ? '+' : ''}${delta} OML points`}
                tier={delta > 0 ? 'gold' : 'default'}
              />
            )}
          </View>
          <View style={styles.pillarRow}>
            <Text style={styles.pillarText}>
              Academic: {simOML.academic} | Physical: {simOML.physical} | Leadership: {simOML.leadership}
            </Text>
          </View>
        </VCard>

        {/* Sliders */}
        <SimpleSlider
          label="GPA"
          value={gpa}
          min={0}
          max={4.0}
          step={0.05}
          onChange={setGPALocal}
          formatValue={(v) => v.toFixed(2)}
        />

        <SimpleSlider
          label="ACFT Score"
          value={acft}
          min={0}
          max={600}
          step={5}
          onChange={setACFTLocal}
        />

        <SimpleSlider
          label="Leadership Score"
          value={lead}
          min={0}
          max={100}
          step={1}
          onChange={setLeadLocal}
        />

        {/* Actions */}
        <View style={styles.actions}>
          <VButton
            title="Apply"
            onPress={handleApply}
            variant="filled"
            style={styles.actionButton}
            accessibilityLabel="Apply simulated scores"
          />
          <VButton
            title="Cancel"
            onPress={() => router.back()}
            variant="outlined"
            style={styles.actionButton}
            accessibilityLabel="Cancel and go back"
          />
        </View>
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
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    fontWeight: '600',
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectionCard: {
    marginBottom: spacing.xl,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectionLabel: {
    ...typography.labelMedium,
    color: colors.onSurfaceVariant,
  },
  projectionValue: {
    ...typography.displaySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  projectionMax: {
    ...typography.bodyMedium,
    color: colors.onSurfaceVariant,
  },
  pillarRow: {
    marginTop: spacing.sm,
  },
  pillarText: {
    ...typography.bodySmall,
    color: colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
