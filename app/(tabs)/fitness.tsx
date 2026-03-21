import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  VCard,
  VButton,
  VInput,
  VMetricCard,
  VEmptyState,
  VSkeletonLoader,
  VChartLine,
} from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import {
  getACFTAssessments,
  insertACFTAssessment,
  type ACFTAssessmentRow,
} from '../../src/services/storage';

interface EventInput {
  label: string;
  key: keyof Omit<ACFTAssessmentRow, 'id' | 'recorded_at' | 'alt_event_name' | 'alt_event_score' | 'total'>;
  placeholder: string;
  unit: string;
}

const ACFT_EVENTS: EventInput[] = [
  { label: 'Deadlift', key: 'deadlift', placeholder: '340', unit: 'lbs' },
  { label: 'Standing Power Throw', key: 'power_throw', placeholder: '12.5', unit: 'm' },
  { label: 'Hand Release Push-ups', key: 'push_ups', placeholder: '60', unit: 'reps' },
  { label: 'Sprint-Drag-Carry', key: 'sprint_drag_carry', placeholder: '90', unit: 'sec' },
  { label: 'Plank', key: 'plank', placeholder: '220', unit: 'sec' },
  { label: '2-Mile Run', key: 'two_mile_run', placeholder: '810', unit: 'sec' },
];

export default function FitnessScreen() {
  const [assessments, setAssessments] = useState<ACFTAssessmentRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [eventValues, setEventValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAssessments();
  }, []);

  async function loadAssessments() {
    try {
      const rows = await getACFTAssessments();
      setAssessments(rows);
    } catch (error) {
      console.error('Failed to load ACFT assessments:', error);
    }
    setIsLoaded(true);
  }

  function updateEventValue(key: string, value: string) {
    setEventValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveAssessment() {
    const deadlift = parseFloat(eventValues.deadlift ?? '');
    const powerThrow = parseFloat(eventValues.power_throw ?? '');
    const pushUps = parseFloat(eventValues.push_ups ?? '');
    const sprintDragCarry = parseFloat(eventValues.sprint_drag_carry ?? '');
    const plank = parseFloat(eventValues.plank ?? '');
    const twoMileRun = parseFloat(eventValues.two_mile_run ?? '');

    // At least one event must be filled
    const hasAny = [deadlift, powerThrow, pushUps, sprintDragCarry, plank, twoMileRun].some(
      (v) => !isNaN(v),
    );
    if (!hasAny) {
      Alert.alert('No Data', 'Please enter at least one ACFT event score.');
      return;
    }

    // Simple total estimate (raw scores, not scaled)
    const total = [deadlift, powerThrow, pushUps, sprintDragCarry, plank, twoMileRun]
      .filter((v) => !isNaN(v))
      .reduce((sum, v) => sum + v, 0);

    try {
      await insertACFTAssessment({
        deadlift: isNaN(deadlift) ? null : deadlift,
        power_throw: isNaN(powerThrow) ? null : powerThrow,
        push_ups: isNaN(pushUps) ? null : pushUps,
        sprint_drag_carry: isNaN(sprintDragCarry) ? null : sprintDragCarry,
        plank: isNaN(plank) ? null : plank,
        two_mile_run: isNaN(twoMileRun) ? null : twoMileRun,
        alt_event_name: null,
        alt_event_score: null,
        total,
      });
      setEventValues({});
      setShowForm(false);
      await loadAssessments();
    } catch (error) {
      console.error('Failed to save assessment:', error);
      Alert.alert('Error', 'Failed to save assessment. Please try again.');
    }
  }

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContent}>
          <VSkeletonLoader width="100%" height={60} />
          {ACFT_EVENTS.map((e) => (
            <VSkeletonLoader
              key={e.key}
              width="100%"
              height={48}
              style={{ marginTop: spacing[3] }}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (assessments.length === 0 && !showForm) {
    return (
      <SafeAreaView style={styles.container}>
        <VEmptyState
          icon={'\u{1F3CB}'}
          headline="No Fitness Assessments Recorded"
          body="Log your ACFT scores to track your physical readiness and see how it impacts your OML."
          ctaLabel="Log Your First ACFT"
          onCtaPress={() => setShowForm(true)}
        />
      </SafeAreaView>
    );
  }

  const latest = assessments[0];
  const latestTotal = latest?.total ?? 0;
  const trendData = assessments
    .slice(0, 10)
    .reverse()
    .map((a) => a.total ?? 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header} accessibilityRole="header">
          ACFT Log
        </Text>

        {/* Latest Score */}
        <VMetricCard
          value={latestTotal > 0 ? String(Math.round(latestTotal)) : '--'}
          label="Latest ACFT Total"
          style={styles.totalCard}
          accessibilityLabel={`Latest ACFT total: ${latestTotal > 0 ? Math.round(latestTotal) : 'not recorded'}`}
        />

        {/* Trend Chart */}
        {trendData.length > 1 && (
          <VCard tier="low" style={styles.chartCard}>
            <Text style={styles.chartTitle}>Performance Trend</Text>
            <VChartLine
              data={trendData}
              width={320}
              height={150}
              accessibilityLabel={`ACFT performance trending over ${trendData.length} assessments`}
            />
          </VCard>
        )}

        {/* Event Breakdown (latest) */}
        {latest && (
          <>
            <Text style={styles.sectionTitle}>Latest Event Breakdown</Text>
            <View style={styles.eventsGrid}>
              {ACFT_EVENTS.map((event) => {
                const val = latest[event.key];
                return (
                  <VCard key={event.key} tier="low" style={styles.eventCard}>
                    <Text style={styles.eventLabel}>{event.label}</Text>
                    <Text style={styles.eventValue}>
                      {val != null ? `${val} ${event.unit}` : '\u2014'}
                    </Text>
                  </VCard>
                );
              })}
            </View>
          </>
        )}

        {/* Add Assessment */}
        {!showForm ? (
          <VButton
            label="Log New Assessment"
            onPress={() => setShowForm(true)}
            variant="secondary"
            style={styles.addButton}
            accessibilityLabel="Log a new ACFT assessment"
          />
        ) : (
          <VCard tier="low" style={styles.formCard}>
            <Text style={styles.formTitle}>New ACFT Assessment</Text>
            {ACFT_EVENTS.map((event) => (
              <VInput
                key={event.key}
                label={`${event.label} (${event.unit})`}
                value={eventValues[event.key] ?? ''}
                onChangeText={(v) => updateEventValue(event.key, v)}
                placeholder={event.placeholder}
                keyboardType="numeric"
                accessibilityLabel={`${event.label} input in ${event.unit}`}
              />
            ))}
            <View style={styles.formActions}>
              <VButton
                label="Cancel"
                onPress={() => {
                  setShowForm(false);
                  setEventValues({});
                }}
                variant="tertiary"
              />
              <VButton label="Save Assessment" onPress={handleSaveAssessment} />
            </View>
          </VCard>
        )}

        {/* Assessment History */}
        {assessments.length > 1 && (
          <>
            <Text style={styles.sectionTitle}>
              History ({assessments.length} assessments)
            </Text>
            {assessments.slice(1).map((a, i) => (
              <VCard key={a.id ?? i} tier="low" style={styles.historyCard}>
                <View style={styles.historyRow}>
                  <Text style={styles.historyTotal}>
                    Total: {a.total != null ? Math.round(a.total) : '--'}
                  </Text>
                  <Text style={styles.historyDate}>{a.recorded_at ?? ''}</Text>
                </View>
              </VCard>
            ))}
          </>
        )}
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
  loadingContent: {
    padding: spacing[4],
    paddingTop: spacing[8],
  },
  header: {
    ...typography.headline_lg,
    color: colors.on_surface,
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  totalCard: {
    marginBottom: spacing[4],
  },
  chartCard: {
    marginBottom: spacing[4],
    alignItems: 'center',
  },
  chartTitle: {
    ...typography.title_sm,
    color: colors.on_surface,
    marginBottom: spacing[3],
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    ...typography.title_md,
    color: colors.on_surface,
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  eventCard: {
    width: '47%',
  },
  eventLabel: {
    ...typography.label_md,
    color: colors.outline,
  },
  eventValue: {
    ...typography.title_md,
    color: colors.on_surface,
    marginTop: spacing[1],
  },
  addButton: {
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  formCard: {
    marginTop: spacing[2],
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  formTitle: {
    ...typography.title_md,
    color: colors.on_surface,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  historyCard: {
    marginBottom: spacing[2],
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTotal: {
    ...typography.title_sm,
    color: colors.on_surface,
  },
  historyDate: {
    ...typography.label_sm,
    color: colors.outline,
  },
});
