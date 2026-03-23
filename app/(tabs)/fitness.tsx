import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  VCard,
  VButton,
  VInput,
  VActivityItem,
  VSkeletonLoader,
} from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import {
  getACFTAssessments,
  insertACFTAssessment,
  type ACFTAssessmentRow,
} from '../../src/services/storage';
import { generateMicroInsight } from '../../src/services/ai';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

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

// Bento card configuration
interface BentoEvent {
  eventKey: keyof Omit<ACFTAssessmentRow, 'id' | 'recorded_at' | 'alt_event_name' | 'alt_event_score' | 'total'>;
  label: string;
  abbrev: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  unit: string;
}

const BENTO_EVENTS: BentoEvent[] = [
  { eventKey: 'deadlift', label: 'DEADLIFT', abbrev: 'MDL', icon: 'weight-lifter', unit: 'lbs' },
  { eventKey: 'push_ups', label: 'PUSH-UPS', abbrev: 'HRP', icon: 'arm-flex', unit: 'reps' },
  { eventKey: 'sprint_drag_carry', label: 'SPRINT-DRAG-CARRY', abbrev: 'SDC', icon: 'run-fast', unit: 'sec' },
  { eventKey: 'plank', label: 'PLANK', abbrev: 'PLK', icon: 'human', unit: 'sec' },
  { eventKey: 'two_mile_run', label: '2-MILE RUN', abbrev: '2MR', icon: 'shoe-print', unit: 'sec' },
];

const MAX_ACFT_TOTAL = 600;

function getReadinessTier(total: number): string {
  if (total >= 560) return 'Elite Tier';
  if (total >= 500) return 'Superior Tier';
  if (total >= 440) return 'Advanced Tier';
  if (total >= 360) return 'Proficient Tier';
  return 'Entry Tier';
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FitnessScreen() {
  const { colors, isDark, glass } = useTheme();
  const [assessments, setAssessments] = useState<ACFTAssessmentRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [eventValues, setEventValues] = useState<Record<string, string>>({});
  const { width: screenWidth } = useWindowDimensions();

  const styles = useMemo(() => makeStyles(colors), [colors]);

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
      // Calculate OML delta from previous assessment
      const prevTotal = assessments.length > 0 ? (assessments[0]?.total ?? 0) : 0;
      const omlDelta = Math.round((total - prevTotal) * 10) / 10;

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

      // Show post-entry micro-insight
      const deltaText = omlDelta !== 0
        ? ` (${omlDelta > 0 ? '+' : ''}${omlDelta} pts vs previous)`
        : '';
      Alert.alert(
        'Assessment Saved',
        `ACFT total: ${Math.round(total)}${deltaText}`
      );

      // Fire-and-forget AI enhancement
      generateMicroInsight('{}', `logged ACFT score of ${Math.round(total)}`, omlDelta)
        .then((insight) => {
          if (insight) {
            Alert.alert('Vanguard AI', insight);
          }
        })
        .catch(() => {});
    } catch (error) {
      console.error('Failed to save assessment:', error);
      Alert.alert('Error', 'Failed to save assessment. Please try again.');
    }
  }

  const openFormForEvent = useCallback((_eventKey: string) => {
    setShowForm(true);
  }, []);

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContent}>
          <VSkeletonLoader width="100%" height={120} />
          <VSkeletonLoader width="100%" height={180} style={{ marginTop: spacing[3] }} />
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

  const hasData = assessments.length > 0;
  const latest = hasData ? assessments[0] : null;
  const latestTotal = latest?.total ?? 0;
  const progressPct = latestTotal / MAX_ACFT_TOTAL;
  const bentoGap = spacing[2];
  const contentPadding = spacing[4];
  const availableWidth = screenWidth - contentPadding * 2;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 1. DUKE READINESS HUD                                          */}
        {/* ──────────────────────────────────────────────────────────────── */}
        <View
          style={styles.hudCard}
          accessibilityLabel={`Duke Readiness score: ${hasData ? Math.round(latestTotal) : 'unranked'} out of ${MAX_ACFT_TOTAL}`}
          accessibilityRole="summary"
        >
          <View style={staticStyles.hudTopRow}>
            <View style={styles.hudLeft}>
              <Text style={styles.hudLabel}>MISSION READINESS ASSESSMENT</Text>
              <Text style={styles.hudHeadline}>DUKE READINESS</Text>
            </View>
            <View style={staticStyles.hudRight}>
              <Text style={styles.hudScore}>
                {hasData ? `${Math.round(latestTotal)}` : '--'}
                <Text style={styles.hudScoreMax}> / {MAX_ACFT_TOTAL}</Text>
              </Text>
              <View style={[
                styles.hudBadge,
                { backgroundColor: hasData ? colors.secondary_container : colors.surface_container },
              ]}>
                <Text style={[
                  styles.hudBadgeText,
                  { color: hasData ? colors.secondary : colors.outline },
                ]}>
                  {hasData ? `Status: ${getReadinessTier(latestTotal)}` : 'Status: Unranked'}
                </Text>
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <View style={staticStyles.hudProgressWrap}>
            <View style={staticStyles.hudProgressTrack}>
              <View
                style={[
                  styles.hudProgressFill,
                  { width: `${Math.min(progressPct * 100, 100)}%` as unknown as number },
                ]}
              />
            </View>
          </View>
        </View>

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 2. EMPTY STATE (no assessments + form not open)                */}
        {/* ──────────────────────────────────────────────────────────────── */}
        {!hasData && !showForm && (
          <View style={staticStyles.emptyWrap}>
            <VCard tier="low" style={staticStyles.emptyCard}>
              <View style={staticStyles.emptyInner}>
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={64}
                  color={colors.outline}
                />
                <Text style={styles.emptyHeadline}>No Training Data Detected</Text>
                <Text style={styles.emptyBody}>
                  Your Army Fitness Test (AFT) log is currently empty. Initialize
                  your baseline metrics to track progress.
                </Text>
                <VButton
                  label="Log Your First AFT"
                  onPress={() => setShowForm(true)}
                  variant="primary"
                  style={staticStyles.emptyCta}
                  accessibilityLabel="Log your first Army Fitness Test assessment"
                />
              </View>
            </VCard>
          </View>
        )}

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 3. BENTO GRID (6 event cards)                                  */}
        {/* ──────────────────────────────────────────────────────────────── */}
        {(hasData || showForm) && (
          <View style={staticStyles.bentoSection}>
            {/* Row 1: Deadlift (2/3) + Push-ups (1/3) */}
            <View style={[staticStyles.bentoRow, { gap: bentoGap }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.bentoCardDeadlift,
                  { width: (availableWidth - bentoGap) * 0.63 },
                  pressed && staticStyles.bentoPressed,
                ]}
                onPress={() => openFormForEvent('deadlift')}
                accessibilityLabel={`Deadlift: ${latest?.deadlift != null ? `${latest.deadlift} lbs` : 'no data'}`}
                accessibilityRole="button"
              >
                <View style={staticStyles.bentoCardHeader}>
                  <MaterialCommunityIcons name="weight-lifter" size={24} color={colors.primary} />
                  <View style={styles.abbrevBadge}>
                    <Text style={styles.abbrevText}>MDL</Text>
                  </View>
                </View>
                <Text style={styles.bentoEventName}>DEADLIFT</Text>
                <Text style={styles.bentoValueDefault}>
                  {latest?.deadlift != null ? `${latest.deadlift}` : '--'}
                </Text>
                <Text style={styles.bentoUnit}>lbs</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.bentoCardPushups,
                  { width: (availableWidth - bentoGap) * 0.37 },
                  pressed && staticStyles.bentoPressed,
                ]}
                onPress={() => openFormForEvent('push_ups')}
                accessibilityLabel={`Push-ups: ${latest?.push_ups != null ? `${latest.push_ups} reps` : 'no data'}`}
                accessibilityRole="button"
              >
                <View style={staticStyles.bentoCardHeader}>
                  <MaterialCommunityIcons name="arm-flex" size={24} color={colors.on_surface} />
                  <View style={styles.abbrevBadgeSecondary}>
                    <Text style={styles.abbrevTextSecondary}>HRP</Text>
                  </View>
                </View>
                <Text style={styles.bentoEventNameSecondary}>PUSH-UPS</Text>
                <Text style={styles.bentoValueSecondary}>
                  {latest?.push_ups != null ? `${latest.push_ups}` : '--'}
                </Text>
                <Text style={styles.bentoUnitSecondary}>reps</Text>
              </Pressable>
            </View>

            {/* Row 1b: Power Throw (standalone, half width since it's the 6th event) */}
            <View style={[staticStyles.bentoRow, { gap: bentoGap }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.bentoCardPowerThrow,
                  { width: (availableWidth - bentoGap) * 0.5 },
                  pressed && staticStyles.bentoPressed,
                ]}
                onPress={() => openFormForEvent('power_throw')}
                accessibilityLabel={`Standing Power Throw: ${latest?.power_throw != null ? `${latest.power_throw} m` : 'no data'}`}
                accessibilityRole="button"
              >
                <View style={staticStyles.bentoCardHeader}>
                  <MaterialCommunityIcons name="basketball" size={24} color={colors.primary} />
                  <View style={styles.abbrevBadge}>
                    <Text style={styles.abbrevText}>SPT</Text>
                  </View>
                </View>
                <Text style={styles.bentoEventName}>POWER THROW</Text>
                <Text style={styles.bentoValueDefault}>
                  {latest?.power_throw != null ? `${latest.power_throw}` : '--'}
                </Text>
                <Text style={styles.bentoUnit}>m</Text>
              </Pressable>

              {/* Row 2b: Plank (half) — POP card */}
              <Pressable
                style={({ pressed }) => [
                  styles.bentoCardPlank,
                  { width: (availableWidth - bentoGap) * 0.5 },
                  pressed && staticStyles.bentoPressed,
                ]}
                onPress={() => openFormForEvent('plank')}
                accessibilityLabel={`Plank: ${latest?.plank != null ? `${formatSeconds(latest.plank)} ` : 'no data'}`}
                accessibilityRole="button"
              >
                <View style={staticStyles.bentoCardHeader}>
                  <MaterialCommunityIcons name="human" size={24} color={colors.secondary_container} />
                  <View style={styles.abbrevBadgePlank}>
                    <Text style={styles.abbrevTextPlank}>PLK</Text>
                  </View>
                </View>
                <Text style={styles.bentoEventNamePlank}>PLANK</Text>
                <Text style={styles.bentoValuePlank}>
                  {latest?.plank != null ? formatSeconds(latest.plank) : '--'}
                </Text>
                <Text style={styles.bentoUnitPlank}>time</Text>
              </Pressable>
            </View>

            {/* Row 2: Sprint-Drag-Carry (half) + placeholder (half) */}
            <View style={[staticStyles.bentoRow, { gap: bentoGap }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.bentoCardSDC,
                  { width: availableWidth },
                  pressed && staticStyles.bentoPressed,
                ]}
                onPress={() => openFormForEvent('sprint_drag_carry')}
                accessibilityLabel={`Sprint-Drag-Carry: ${latest?.sprint_drag_carry != null ? `${latest.sprint_drag_carry} sec` : 'no data'}`}
                accessibilityRole="button"
              >
                <View style={staticStyles.bentoCardHeader}>
                  <MaterialCommunityIcons name="run-fast" size={24} color={colors.primary} />
                  <View style={styles.abbrevBadge}>
                    <Text style={styles.abbrevText}>SDC</Text>
                  </View>
                </View>
                <Text style={styles.bentoEventName}>SPRINT-DRAG-CARRY</Text>
                <View style={staticStyles.sdcRow}>
                  <Text style={styles.bentoValueDefault}>
                    {latest?.sprint_drag_carry != null ? formatSeconds(latest.sprint_drag_carry) : '--'}
                  </Text>
                  <View style={staticStyles.sdcBars}>
                    <View style={[staticStyles.sdcBar, { backgroundColor: colors.primary }]} />
                    <View style={[staticStyles.sdcBar, { backgroundColor: colors.secondary }]} />
                    <View style={[staticStyles.sdcBar, { backgroundColor: colors.tertiary }]} />
                  </View>
                </View>
                <Text style={styles.bentoUnit}>time</Text>
              </Pressable>
            </View>

            {/* Row 3: 2-Mile Run (full width) */}
            <View style={[staticStyles.bentoRow, { gap: bentoGap }]}>
              <Pressable
                style={({ pressed }) => [
                  styles.bentoCard2MR,
                  { width: availableWidth },
                  pressed && staticStyles.bentoPressed,
                ]}
                onPress={() => openFormForEvent('two_mile_run')}
                accessibilityLabel={`2-Mile Run: ${latest?.two_mile_run != null ? `${formatSeconds(latest.two_mile_run)}` : 'no data'}`}
                accessibilityRole="button"
              >
                <View style={staticStyles.bentoCardHeader}>
                  <MaterialCommunityIcons name="shoe-print" size={24} color={colors.primary} />
                  <View style={styles.abbrevBadge}>
                    <Text style={styles.abbrevText}>2MR</Text>
                  </View>
                </View>
                <Text style={styles.bentoEventName}>2-MILE RUN</Text>
                <View style={staticStyles.runRow}>
                  <View>
                    <Text style={styles.bentoValueDefault}>
                      {latest?.two_mile_run != null ? formatSeconds(latest.two_mile_run) : '--'}
                    </Text>
                    <Text style={styles.bentoUnit}>final time</Text>
                  </View>
                  {latest?.two_mile_run != null && (
                    <View style={staticStyles.paceWrap}>
                      <Text style={styles.paceLabel}>PACE</Text>
                      <Text style={styles.paceValue}>
                        {formatSeconds(latest.two_mile_run / 2)}/mi
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 4. ASSESSMENT FORM (modal-style inline)                        */}
        {/* ──────────────────────────────────────────────────────────────── */}
        {showForm && (
          <VCard tier="low" style={staticStyles.formCard}>
            <Text style={styles.formTitle}>NEW ACFT ASSESSMENT</Text>
            {ACFT_EVENTS.map((event) => (
              <VInput
                key={event.key}
                label={`${event.label} (${event.unit})`}
                value={eventValues[event.key] ?? ''}
                onChangeText={(v: string) => updateEventValue(event.key, v)}
                placeholder={event.placeholder}
                keyboardType="numeric"
                accessibilityLabel={`${event.label} input in ${event.unit}`}
              />
            ))}
            <View style={staticStyles.formActions}>
              <VButton
                label="Cancel"
                onPress={() => {
                  setShowForm(false);
                  setEventValues({});
                }}
                variant="tertiary"
                accessibilityLabel="Cancel new assessment"
              />
              <VButton
                label="Save Assessment"
                onPress={handleSaveAssessment}
                accessibilityLabel="Save ACFT assessment"
              />
            </View>
          </VCard>
        )}

        {/* ──────────────────────────────────────────────────────────────── */}
        {/* 5. LOG BUTTON + ASSESSMENT HISTORY                             */}
        {/* ──────────────────────────────────────────────────────────────── */}
        {hasData && !showForm && (
          <VButton
            label="Log New Assessment"
            onPress={() => setShowForm(true)}
            variant="secondary"
            style={staticStyles.logButton}
            accessibilityLabel="Log a new ACFT assessment"
          />
        )}

        {assessments.length > 0 && (
          <View style={staticStyles.historySection}>
            <Text style={styles.historyTitle}>
              ASSESSMENT HISTORY ({assessments.length})
            </Text>
            {assessments.map((a, i) => (
              <VActivityItem
                key={a.id ?? i}
                title={`ACFT Total: ${a.total != null ? Math.round(a.total) : '--'}`}
                subtitle={
                  a.deadlift != null || a.push_ups != null
                    ? [
                        a.deadlift != null ? `MDL ${a.deadlift}` : null,
                        a.push_ups != null ? `HRP ${a.push_ups}` : null,
                        a.two_mile_run != null ? `2MR ${formatSeconds(a.two_mile_run)}` : null,
                      ]
                        .filter(Boolean)
                        .join(' | ')
                    : undefined
                }
                timestamp={a.recorded_at ?? ''}
                pointDelta={
                  i < assessments.length - 1 && a.total != null && assessments[i + 1]?.total != null
                    ? Math.round((a.total ?? 0) - (assessments[i + 1]?.total ?? 0))
                    : undefined
                }
                style={staticStyles.historyItem}
                accessibilityLabel={`Assessment: total ${a.total != null ? Math.round(a.total) : 'unknown'}, recorded ${a.recorded_at ?? ''}`}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Static styles (no color dependencies)
// ---------------------------------------------------------------------------

const staticStyles = StyleSheet.create({
  hudTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hudRight: {
    alignItems: 'flex-end',
  },
  hudProgressWrap: {
    marginTop: spacing[4],
  },
  hudProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: roundness.sm,
    overflow: 'hidden',
  },

  // ── Empty State ──
  emptyWrap: {
    marginBottom: spacing[4],
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing[10],
    paddingHorizontal: spacing[6],
  },
  emptyInner: {
    alignItems: 'center',
    gap: spacing[3],
  },
  emptyCta: {
    marginTop: spacing[3],
    minWidth: 200,
  },

  // ── Bento Grid ──
  bentoSection: {
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  bentoRow: {
    flexDirection: 'row',
  },
  bentoPressed: {
    opacity: 0.85,
  },

  // Card headers (shared)
  bentoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  sdcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  sdcBars: {
    flexDirection: 'row',
    gap: spacing[1],
    flex: 1,
    height: 6,
  },
  sdcBar: {
    flex: 1,
    height: 6,
    borderRadius: roundness.sm,
  },

  runRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  paceWrap: {
    alignItems: 'flex-end',
  },

  // ── Form ──
  formCard: {
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[3],
    marginTop: spacing[2],
  },

  // ── Log Button ──
  logButton: {
    marginBottom: spacing[4],
  },

  // ── Assessment History ──
  historySection: {
    marginTop: spacing[2],
  },
  historyItem: {
    // Spacing between items handled by VActivityItem padding
  },
});

// ---------------------------------------------------------------------------
// Theme-dependent styles
// ---------------------------------------------------------------------------

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
    loadingContent: {
      padding: spacing[4],
      paddingTop: spacing[8],
    },

    // ── HUD ──
    hudCard: {
      backgroundColor: colors.primary_container,
      borderRadius: roundness.sm,
      padding: spacing[4],
      marginBottom: spacing[4],
    },
    hudLeft: {
      flex: 1,
      marginRight: spacing[3],
    },
    hudLabel: {
      ...typography.label_sm,
      color: colors.on_primary,
      textTransform: 'uppercase',
      letterSpacing: 3,
      opacity: 0.7,
    },
    hudHeadline: {
      fontFamily: 'PublicSans-Black',
      fontSize: 28,
      fontWeight: '900',
      fontStyle: 'italic',
      color: colors.on_primary,
      textTransform: 'uppercase',
      lineHeight: 34,
      marginTop: spacing[1],
    },
    hudScore: {
      fontFamily: 'PublicSans-Black',
      fontSize: 40,
      fontWeight: '900',
      color: colors.on_primary,
      lineHeight: 44,
    },
    hudScoreMax: {
      fontFamily: 'PublicSans-Black',
      fontSize: 20,
      fontWeight: '900',
      color: colors.on_primary,
      opacity: 0.5,
    },
    hudBadge: {
      borderRadius: roundness.sm,
      paddingVertical: spacing[1],
      paddingHorizontal: spacing[2],
      marginTop: spacing[1],
    },
    hudBadgeText: {
      ...typography.label_sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    hudProgressFill: {
      height: 6,
      backgroundColor: colors.secondary,
      borderRadius: roundness.sm,
      shadowColor: colors.secondary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 2,
    },

    // ── Empty State ──
    emptyHeadline: {
      ...typography.headline_sm,
      color: colors.on_surface,
      textAlign: 'center',
      textTransform: 'uppercase',
      fontWeight: '900',
    },
    emptyBody: {
      ...typography.body_md,
      color: colors.outline,
      textAlign: 'center',
      maxWidth: 300,
    },

    // ── Bento Cards ──
    abbrevBadge: {
      backgroundColor: colors.surface_container,
      borderRadius: roundness.sm,
      paddingVertical: 2,
      paddingHorizontal: spacing[2],
    },
    abbrevText: {
      ...typography.label_sm,
      color: colors.on_surface,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },

    // Deadlift card
    bentoCardDeadlift: {
      backgroundColor: colors.surface_container_highest,
      borderRadius: roundness.sm,
      padding: spacing[4],
      minHeight: 44,
    },
    bentoEventName: {
      fontFamily: 'PublicSans-Black',
      fontSize: 14,
      fontWeight: '900',
      color: colors.on_surface,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bentoValueDefault: {
      fontFamily: 'PublicSans-Black',
      fontSize: 32,
      fontWeight: '900',
      color: colors.on_surface,
      lineHeight: 38,
      marginTop: spacing[1],
    },
    bentoUnit: {
      ...typography.label_sm,
      color: colors.outline,
      textTransform: 'uppercase',
    },

    // Push-ups card
    bentoCardPushups: {
      backgroundColor: colors.secondary_container,
      borderRadius: roundness.sm,
      padding: spacing[4],
      minHeight: 44,
    },
    abbrevBadgeSecondary: {
      backgroundColor: 'rgba(0,0,0,0.08)',
      borderRadius: roundness.sm,
      paddingVertical: 2,
      paddingHorizontal: spacing[2],
    },
    abbrevTextSecondary: {
      ...typography.label_sm,
      color: colors.secondary,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    bentoEventNameSecondary: {
      fontFamily: 'PublicSans-Black',
      fontSize: 14,
      fontWeight: '900',
      color: colors.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bentoValueSecondary: {
      fontFamily: 'PublicSans-Black',
      fontSize: 32,
      fontWeight: '900',
      color: colors.secondary,
      lineHeight: 38,
      marginTop: spacing[1],
    },
    bentoUnitSecondary: {
      ...typography.label_sm,
      color: colors.secondary,
      opacity: 0.6,
      textTransform: 'uppercase',
    },

    // Power Throw card
    bentoCardPowerThrow: {
      backgroundColor: colors.surface_container_high,
      borderRadius: roundness.sm,
      padding: spacing[4],
      minHeight: 44,
    },

    // Plank card — primary bg (POP card)
    bentoCardPlank: {
      backgroundColor: colors.primary,
      borderRadius: roundness.sm,
      padding: spacing[4],
      minHeight: 44,
    },
    abbrevBadgePlank: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: roundness.sm,
      paddingVertical: 2,
      paddingHorizontal: spacing[2],
    },
    abbrevTextPlank: {
      ...typography.label_sm,
      color: colors.on_primary,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    bentoEventNamePlank: {
      fontFamily: 'PublicSans-Black',
      fontSize: 14,
      fontWeight: '900',
      color: colors.on_primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bentoValuePlank: {
      fontFamily: 'PublicSans-Black',
      fontSize: 32,
      fontWeight: '900',
      color: colors.on_primary,
      lineHeight: 38,
      marginTop: spacing[1],
    },
    bentoUnitPlank: {
      ...typography.label_sm,
      color: colors.on_primary,
      opacity: 0.7,
      textTransform: 'uppercase',
    },

    // Sprint-Drag-Carry
    bentoCardSDC: {
      backgroundColor: colors.surface_container,
      borderRadius: roundness.sm,
      padding: spacing[4],
      minHeight: 44,
    },

    // 2-Mile Run
    bentoCard2MR: {
      backgroundColor: colors.surface_container_low,
      borderRadius: roundness.sm,
      padding: spacing[4],
      minHeight: 44,
    },
    paceLabel: {
      ...typography.label_sm,
      color: colors.outline,
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    paceValue: {
      ...typography.title_lg,
      color: colors.on_surface,
      fontWeight: '700',
    },

    // ── Form ──
    formTitle: {
      fontFamily: 'PublicSans-Black',
      fontSize: 16,
      fontWeight: '900',
      color: colors.on_surface,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    // ── Assessment History ──
    historyTitle: {
      ...typography.label_md,
      color: colors.outline,
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: spacing[3],
    },
  });
}
