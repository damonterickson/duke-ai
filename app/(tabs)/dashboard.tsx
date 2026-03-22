import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import {
  VConicGauge,
  VProgressBar,
  VCard,
  VActivityItem,
  VEmptyState,
  VSkeletonLoader,
  VGoalCard,
  VButton,
  VInsightCard,
} from '../../src/components';
import {
  colors,
  typography,
  spacing,
  roundness,
  gradients,
} from '../../src/theme/tokens';
import { useScoresStore } from '../../src/stores/scores';
import { useProfileStore } from '../../src/stores/profile';
import { useGoalsStore } from '../../src/stores/goals';
import { getCachedBriefing } from '../../src/services/storage';
import { isLastBriefingLocal, getLastBriefingTimestamp } from '../../src/services/ai';

type GoalCategory = 'gpa' | 'acft' | 'leadership' | 'oml';

const CATEGORY_OPTIONS: { value: GoalCategory; label: string; icon: string }[] = [
  { value: 'acft', label: 'ACFT', icon: '\u{1F4AA}' },
  { value: 'gpa', label: 'GPA', icon: '\u{1F4DA}' },
  { value: 'leadership', label: 'Leadership', icon: '\u{1F396}\uFE0F' },
  { value: 'oml', label: 'OML', icon: '\u{1F4CA}' },
];

// Pillar maxes per OML formula
const ACADEMIC_MAX = 400;
const PHYSICAL_MAX = 200;
const LEADERSHIP_MAX = 400;

const PILLAR_WEIGHTS = {
  academic: 40,
  physical: 20,
  leadership: 40,
};

const MAX_GOALS = 5;

export default function DashboardScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const isWide = screenWidth >= 768;

  const scores = useScoresStore();
  const profile = useProfileStore();
  const goalsStore = useGoalsStore();
  const isLoaded = scores.isLoaded;

  // AI briefing
  const [briefingText, setBriefingText] = useState<string | null>(null);
  useEffect(() => {
    const cached = getCachedBriefing();
    if (cached) setBriefingText(cached);
  }, []);

  // Add goal modal state
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newCategory, setNewCategory] = useState<GoalCategory>('acft');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const latestScore = scores.scoreHistory[0];
  const totalOml = latestScore?.total_oml ?? null;
  const gpa = latestScore?.gpa ?? null;
  const acftTotal = latestScore?.acft_total ?? null;
  const leadershipEval = latestScore?.leadership_eval ?? null;

  const activeGoals = goalsStore.getActiveGoals();

  function handleCreateGoal() {
    if (!newTitle.trim() || !newTarget.trim() || !newDeadline.trim()) return;
    const target = parseFloat(newTarget);
    if (isNaN(target) || target <= 0) return;
    if (activeGoals.length >= MAX_GOALS) return;

    goalsStore.addGoal({
      title: newTitle.trim(),
      category: newCategory,
      metric: newCategory,
      target_value: target,
      current_value: 0,
      baseline_value: 0,
      deadline: newDeadline.trim(),
      status: 'active',
      created_by: 'user',
      oml_impact: null,
      completed_at: null,
    });

    setShowAddGoal(false);
    setNewTitle('');
    setNewTarget('');
    setNewDeadline('');
    setNewCategory('acft');
  }

  // Loading state
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContent}>
          <VSkeletonLoader width={120} height={120} radius="xl" />
          <VSkeletonLoader width="100%" height={24} style={{ marginTop: spacing[4] }} />
          <VSkeletonLoader width="100%" height={24} style={{ marginTop: spacing[2] }} />
          <VSkeletonLoader width="100%" height={24} style={{ marginTop: spacing[2] }} />
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (totalOml == null && gpa == null && acftTotal == null) {
    return (
      <SafeAreaView style={styles.container}>
        <VEmptyState
          icon={'\u{1F3AF}'}
          headline="Your Mission Profile Awaits"
          body="Enter your first scores to see your OML projection and track your progress."
          ctaLabel="Get Started"
          onCtaPress={() => router.push('/onboarding/welcome')}
        />
      </SafeAreaView>
    );
  }

  const gaugeProgress = totalOml != null ? totalOml / 1000 : 0;
  const scoreDisplay = totalOml != null ? totalOml.toFixed(1) : '--';

  // Pillar estimates
  const academicEstimate = gpa != null ? (gpa / 4.0) * ACADEMIC_MAX : 0;
  const physicalEstimate = acftTotal != null ? (acftTotal / 600) * PHYSICAL_MAX : 0;
  const leadershipEstimate = leadershipEval != null ? (leadershipEval / 100) * LEADERSHIP_MAX : 0;

  const recentHistory = scores.scoreHistory.slice(0, 5);

  const insightText = briefingText ?? 'Increase your ACFT composite to 580 to jump 12 positions in the OML ranking.';

  // Briefing timestamp
  const briefingTimestamp = getLastBriefingTimestamp();
  const briefingIsLocal = isLastBriefingLocal();

  function formatBriefingTimestamp(): string {
    if (briefingIsLocal) return 'Offline briefing \u2014 connect for AI insights';
    if (!briefingTimestamp) return '';
    const now = Date.now();
    const diffMs = now - briefingTimestamp;
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'Last updated: just now';
    if (diffMinutes < 60) return `Last updated: ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    const date = new Date(briefingTimestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `Last updated: Today at ${displayHours}:${minutes} ${ampm}`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO SECTION ── */}
        <View
          style={[
            styles.heroCard,
            isWide && styles.heroCardWide,
          ]}
          accessibilityLabel="Mission Readiness Profile hero section"
        >
          {/* Gauge Side */}
          <View style={[styles.gaugeSection, isWide && styles.gaugeSectionWide]}>
            <Text style={styles.projectedLabel}>PROJECTED SCORE</Text>
            <VConicGauge
              progress={gaugeProgress}
              size={160}
              strokeWidth={14}
              label={scoreDisplay}
              accessibilityLabel={
                totalOml != null
                  ? `Projected OML Score: ${scoreDisplay} out of 1000`
                  : 'OML Score not yet calculated'
              }
            />
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>TOP 15%</Text>
            </View>
          </View>

          {/* Text Side */}
          <View style={[styles.heroTextSection, isWide && styles.heroTextSectionWide]}>
            <Text
              style={styles.heroHeadline}
              accessibilityRole="header"
            >
              Mission Readiness Profile
            </Text>
            <Text style={styles.heroDescription}>
              Tier 1 candidate for Distinguished Military Graduate. Your composite score places you among the top performers in your year group.
            </Text>
            <VInsightCard
              icon="psychology"
              label="Vanguard AI Insight"
              text={insightText}
              style={styles.insightCard}
            />
            {formatBriefingTimestamp() !== '' && (
              <Text style={styles.briefingTimestamp}>
                {formatBriefingTimestamp()}
              </Text>
            )}
          </View>
        </View>

        {/* ── STAT CARDS ── */}
        <View style={[styles.statCardsRow, isWide && styles.statCardsRowWide]}>
          {/* Academic */}
          <View style={[styles.statCard, isWide && styles.statCardWide]}>
            <View style={styles.statCardTopRow}>
              <View style={styles.statIconBadge}>
                <MaterialIcons name="school" size={20} color={colors.on_surface} />
              </View>
              <Text style={styles.statWeightLabel}>
                WEIGHT: {PILLAR_WEIGHTS.academic}%
              </Text>
            </View>
            <Text style={styles.statCardTitle}>Academic Pts</Text>
            <View style={styles.statScoreRow}>
              <Text style={styles.statScoreValue}>
                {gpa != null ? Math.round(academicEstimate) : '--'}
              </Text>
              <Text style={styles.statScoreMax}>/ {ACADEMIC_MAX}</Text>
            </View>
            <VProgressBar
              progress={gpa != null ? academicEstimate / ACADEMIC_MAX : 0}
              height={6}
              accessibilityLabel={`Academic pillar: ${gpa != null ? Math.round(academicEstimate) : 0} of ${ACADEMIC_MAX}`}
            />
          </View>

          {/* Physical */}
          <View style={[styles.statCard, isWide && styles.statCardWide]}>
            <View style={styles.statCardTopRow}>
              <View style={styles.statIconBadge}>
                <MaterialIcons name="fitness-center" size={20} color={colors.on_surface} />
              </View>
              <Text style={styles.statWeightLabel}>
                WEIGHT: {PILLAR_WEIGHTS.physical}%
              </Text>
            </View>
            <Text style={styles.statCardTitle}>Physical Pts</Text>
            <View style={styles.statScoreRow}>
              <Text style={styles.statScoreValue}>
                {acftTotal != null ? Math.round(physicalEstimate) : '--'}
              </Text>
              <Text style={styles.statScoreMax}>/ {PHYSICAL_MAX}</Text>
            </View>
            <VProgressBar
              progress={acftTotal != null ? physicalEstimate / PHYSICAL_MAX : 0}
              height={6}
              accessibilityLabel={`Physical pillar: ${acftTotal != null ? Math.round(physicalEstimate) : 0} of ${PHYSICAL_MAX}`}
            />
          </View>

          {/* Leadership */}
          <View style={[styles.statCard, isWide && styles.statCardWide]}>
            <View style={styles.statCardTopRow}>
              <View style={styles.statIconBadge}>
                <MaterialIcons name="star" size={20} color={colors.on_surface} />
              </View>
              <Text style={styles.statWeightLabel}>
                WEIGHT: {PILLAR_WEIGHTS.leadership}%
              </Text>
            </View>
            <Text style={styles.statCardTitle}>Leadership Pts</Text>
            <View style={styles.statScoreRow}>
              <Text style={styles.statScoreValue}>
                {leadershipEval != null ? Math.round(leadershipEstimate) : '--'}
              </Text>
              <Text style={styles.statScoreMax}>/ {LEADERSHIP_MAX}</Text>
            </View>
            <VProgressBar
              progress={leadershipEval != null ? leadershipEstimate / LEADERSHIP_MAX : 0}
              height={6}
              accessibilityLabel={`Leadership pillar: ${leadershipEval != null ? Math.round(leadershipEstimate) : 0} of ${LEADERSHIP_MAX}`}
            />
          </View>
        </View>

        {/* ── ACTIVE GOALS ── */}
        <View style={styles.goalsSectionHeader}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Active Goals ({activeGoals.length}/{MAX_GOALS})
          </Text>
          {activeGoals.length < MAX_GOALS && (
            <Pressable
              onPress={() => setShowAddGoal(true)}
              accessibilityRole="button"
              accessibilityLabel="Add a new goal"
              style={({ pressed }) => [
                styles.addButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          )}
        </View>

        {activeGoals.length > 0 ? (
          <View style={styles.goalsList}>
            {activeGoals.map((goal) => (
              <VGoalCard
                key={goal.id}
                title={goal.title}
                category={goal.category as GoalCategory}
                currentValue={goal.current_value ?? 0}
                targetValue={goal.target_value}
                deadline={goal.deadline}
                omlImpact={goal.oml_impact ?? undefined}
                createdBy={goal.created_by as 'user' | 'ai'}
                status={goal.status as 'active' | 'completed' | 'expired' | 'paused'}
                onPress={() => router.push(`/goal/${goal.id}`)}
              />
            ))}
          </View>
        ) : (
          <VEmptyState
            icon={'\u{1F3AF}'}
            headline="Set Your First Goal"
            body="Track your progress toward a stronger OML"
            ctaLabel="Add Goal"
            onCtaPress={() => setShowAddGoal(true)}
            style={styles.goalsEmpty}
            accessibilityLabel="No active goals. Set your first goal to track progress."
          />
        )}

        {/* ── ACTIVITY LOG ── */}
        {recentHistory.length > 0 && (
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle} accessibilityRole="header">
                Recent Activity Log
              </Text>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="View all activity entries"
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.activityViewAll}>VIEW ALL ENTRIES</Text>
              </Pressable>
            </View>
            <View style={styles.activityList}>
              {recentHistory.map((entry, i) => {
                const delta = entry.total_oml != null
                  ? (i < recentHistory.length - 1 && recentHistory[i + 1]?.total_oml != null
                    ? Math.round((entry.total_oml - (recentHistory[i + 1]?.total_oml ?? 0)) * 10) / 10
                    : undefined)
                  : undefined;
                return (
                  <View key={entry.id ?? i} style={styles.activityItemRow}>
                    <View style={styles.activityIconCircle}>
                      <MaterialIcons
                        name="description"
                        size={20}
                        color={colors.outline}
                      />
                    </View>
                    <View style={styles.activityItemContent}>
                      <VActivityItem
                        title={`OML: ${entry.total_oml != null ? Math.round(entry.total_oml) : '--'}`}
                        subtitle={`GPA: ${entry.gpa?.toFixed(2) ?? '--'} | ACFT: ${entry.acft_total != null ? Math.round(entry.acft_total) : '--'}`}
                        pointDelta={delta}
                        timestamp={entry.recorded_at ?? ''}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Bottom spacer for FAB clearance */}
        <View style={{ height: spacing[16] }} />
      </ScrollView>

      {/* ── NEW SIMULATION FAB ── */}
      <Pressable
        onPress={() => router.push('/what-if')}
        accessibilityLabel="New Simulation"
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.fabWrapper,
          pressed && { opacity: 0.85 },
        ]}
      >
        <LinearGradient
          colors={gradients.primaryCta.colors as unknown as [string, string]}
          start={gradients.primaryCta.start}
          end={gradients.primaryCta.end}
          style={styles.fab}
        >
          <MaterialIcons name="calculate" size={22} color={colors.on_primary} />
          <Text style={styles.fabText}>NEW SIMULATION</Text>
        </LinearGradient>
      </Pressable>

      {/* ── ADD GOAL MODAL ── */}
      <Modal
        visible={showAddGoal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddGoal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} accessibilityRole="header">
                Create Goal
              </Text>
              <VButton
                label="Cancel"
                onPress={() => setShowAddGoal(false)}
                variant="tertiary"
                accessibilityLabel="Cancel creating goal"
              />
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryPicker}>
              {CATEGORY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setNewCategory(opt.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${opt.label} category`}
                  accessibilityState={{ selected: newCategory === opt.value }}
                  style={[
                    styles.categoryOption,
                    newCategory === opt.value && styles.categoryOptionSelected,
                  ]}
                >
                  <Text style={styles.categoryOptionIcon}>{opt.icon}</Text>
                  <Text
                    style={[
                      styles.categoryOptionLabel,
                      newCategory === opt.value && styles.categoryOptionLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Goal Title</Text>
            <TextInput
              style={styles.textInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Improve ACFT to 550"
              placeholderTextColor={colors.outline}
              accessibilityLabel="Goal title input"
            />

            <Text style={styles.fieldLabel}>Target Value</Text>
            <TextInput
              style={styles.textInput}
              value={newTarget}
              onChangeText={setNewTarget}
              placeholder="550"
              placeholderTextColor={colors.outline}
              keyboardType="numeric"
              accessibilityLabel="Target value input"
            />

            <Text style={styles.fieldLabel}>Deadline (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={newDeadline}
              onChangeText={setNewDeadline}
              placeholder="2026-05-01"
              placeholderTextColor={colors.outline}
              accessibilityLabel="Deadline input"
            />

            <VButton
              label="Create Goal"
              onPress={handleCreateGoal}
              variant="primary"
              disabled={!newTitle.trim() || !newTarget.trim() || !newDeadline.trim()}
              style={styles.createButton}
              accessibilityLabel="Create new goal"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
  },

  // ── Hero Section ──
  heroCard: {
    backgroundColor: colors.surface_container_lowest,
    borderRadius: roundness.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
    // No border — Rule 1
  },
  heroCardWide: {
    flexDirection: 'row',
    gap: spacing[6],
  },
  gaugeSection: {
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  gaugeSectionWide: {
    marginBottom: 0,
    flex: 0,
  },
  projectedLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: typography.label_sm.fontSize,
    fontWeight: '500',
    letterSpacing: 2,
    lineHeight: typography.label_sm.lineHeight,
    color: colors.outline,
    textTransform: 'uppercase',
    marginBottom: spacing[3],
  },
  topBadge: {
    backgroundColor: colors.secondary_container,
    borderRadius: roundness.sm,
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    marginTop: spacing[3],
  },
  topBadgeText: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  heroTextSection: {
    flex: 1,
  },
  heroTextSectionWide: {
    justifyContent: 'center',
  },
  heroHeadline: {
    ...typography.headline_sm,
    fontWeight: '700',
    color: colors.on_surface,
    marginBottom: spacing[2],
  },
  heroDescription: {
    ...typography.body_md,
    color: colors.outline,
    marginBottom: spacing[4],
    lineHeight: 22,
  },
  insightCard: {
    // Inherits VInsightCard styling
  },
  briefingTimestamp: {
    ...typography.label_sm,
    color: colors.outline,
    marginTop: spacing[2],
  },

  // ── Stat Cards ──
  statCardsRow: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  statCardsRowWide: {
    flexDirection: 'row',
  },
  statCard: {
    backgroundColor: colors.surface_container_lowest,
    borderRadius: roundness.xl,
    padding: spacing[4],
    // No border — Rule 1
    shadowColor: colors.on_surface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statCardWide: {
    flex: 1,
  },
  statCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: roundness.lg,
    backgroundColor: colors.surface_container_high,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statWeightLabel: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: typography.label_sm.fontSize,
    fontWeight: '500',
    letterSpacing: 1,
    color: colors.outline,
    textTransform: 'uppercase',
  },
  statCardTitle: {
    ...typography.title_md,
    fontWeight: '700',
    color: colors.on_surface,
    marginBottom: spacing[2],
  },
  statScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing[3],
  },
  statScoreValue: {
    fontFamily: typography.headline_sm.fontFamily,
    fontSize: 28,
    fontWeight: '900',
    color: colors.on_surface,
  },
  statScoreMax: {
    ...typography.body_md,
    color: colors.outline,
    marginLeft: spacing[1],
  },

  // ── Goals Section ──
  goalsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    ...typography.title_md,
    fontWeight: '700',
    color: colors.on_surface,
  },
  addButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minHeight: 44,
    justifyContent: 'center',
  },
  addButtonText: {
    ...typography.label_lg,
    color: colors.tertiary,
  },
  goalsList: {
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  goalsEmpty: {
    paddingVertical: spacing[8],
    minHeight: 200,
    marginBottom: spacing[4],
  },

  // ── Activity Log ──
  activityCard: {
    backgroundColor: colors.surface_container_lowest,
    borderRadius: roundness.xl,
    padding: spacing[4],
    marginTop: spacing[2],
    // No border — Rule 1
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  activityTitle: {
    ...typography.headline_sm,
    fontWeight: '700',
    color: colors.on_surface,
    fontSize: 22,
  },
  activityViewAll: {
    fontFamily: typography.label_sm.fontFamily,
    fontSize: typography.label_sm.fontSize,
    fontWeight: '500',
    letterSpacing: 1,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  activityList: {
    gap: spacing[1],
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  activityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: roundness.xl,
    backgroundColor: colors.surface_container_low,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityItemContent: {
    flex: 1,
  },

  // ── FAB ──
  fabWrapper: {
    position: 'absolute',
    bottom: spacing[8],
    right: spacing[4],
    minHeight: 44,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: roundness.xl,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    minHeight: 44,
    shadowColor: colors.on_surface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontFamily: typography.label_lg.fontFamily,
    fontSize: typography.label_lg.fontSize,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.on_primary,
    textTransform: 'uppercase',
  },

  // ── Modal ──
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: spacing[4],
    paddingBottom: spacing[12],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },
  modalTitle: {
    ...typography.headline_md,
    color: colors.on_surface,
  },
  fieldLabel: {
    ...typography.label_lg,
    color: colors.on_surface,
    marginBottom: spacing[2],
    marginTop: spacing[4],
  },
  categoryPicker: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  categoryOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: roundness.lg,
    backgroundColor: colors.surface_container_low,
    minHeight: 44,
  },
  categoryOptionSelected: {
    backgroundColor: `rgba(204, 167, 48, 0.12)`,
  },
  categoryOptionIcon: {
    fontSize: 20,
    marginBottom: spacing[1],
  },
  categoryOptionLabel: {
    ...typography.label_sm,
    color: colors.outline,
  },
  categoryOptionLabelSelected: {
    color: colors.tertiary,
  },
  textInput: {
    ...typography.body_lg,
    color: colors.on_surface,
    backgroundColor: colors.surface_container_low,
    borderRadius: roundness.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minHeight: 48,
  },
  createButton: {
    marginTop: spacing[6],
  },
});
