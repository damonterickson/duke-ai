import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  VConicGauge,
  VProgressBar,
  VCard,
  VActivityItem,
  VEmptyState,
  VSkeletonLoader,
  VGoalCard,
  VButton,
} from '../../src/components';
import { colors, typography, spacing, roundness } from '../../src/theme/tokens';
import { useScoresStore } from '../../src/stores/scores';
import { useProfileStore } from '../../src/stores/profile';

type GoalCategory = 'gpa' | 'acft' | 'leadership' | 'oml';

interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  currentValue: number;
  targetValue: number;
  deadline: string;
  omlImpact?: number;
  createdBy: 'user' | 'ai';
  status: 'active' | 'completed' | 'expired' | 'paused';
}

const CATEGORY_OPTIONS: { value: GoalCategory; label: string; icon: string }[] = [
  { value: 'acft', label: 'ACFT', icon: '\u{1F4AA}' },
  { value: 'gpa', label: 'GPA', icon: '\u{1F4DA}' },
  { value: 'leadership', label: 'Leadership', icon: '\u{1F396}\uFE0F' },
  { value: 'oml', label: 'OML', icon: '\u{1F4CA}' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const scores = useScoresStore();
  const profile = useProfileStore();
  const isLoaded = scores.isLoaded;

  // Will be replaced with real store import after merge
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Add goal form state
  const [newCategory, setNewCategory] = useState<GoalCategory>('acft');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const latestScore = scores.scoreHistory[0];
  const totalOml = latestScore?.total_oml ?? null;
  const gpa = latestScore?.gpa ?? null;
  const acftTotal = latestScore?.acft_total ?? null;
  const leadershipEval = latestScore?.leadership_eval ?? null;

  // Pillar maxes: Academic 400, Leadership 400, Physical 200 (per OML formula)
  const academicMax = 400;
  const leadershipMax = 400;
  const physicalMax = 200;

  const activeGoals = goals.filter((g) => g.status === 'active');
  const MAX_GOALS = 5;

  function handleCreateGoal() {
    if (!newTitle.trim() || !newTarget.trim() || !newDeadline.trim()) return;

    const target = parseFloat(newTarget);
    if (isNaN(target) || target <= 0) return;

    if (activeGoals.length >= MAX_GOALS) return;

    const newGoal: Goal = {
      id: String(Date.now()),
      title: newTitle.trim(),
      category: newCategory,
      currentValue: 0,
      targetValue: target,
      deadline: newDeadline.trim(),
      createdBy: 'user',
      status: 'active',
    };

    setGoals((prev) => [...prev, newGoal]);
    setShowAddGoal(false);
    setNewTitle('');
    setNewTarget('');
    setNewDeadline('');
    setNewCategory('acft');
  }

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
  const gaugeLabel = totalOml != null ? String(Math.round(totalOml)) : '--';

  // Estimate pillar scores from available data
  const academicEstimate = gpa != null ? (gpa / 4.0) * academicMax : 0;
  const physicalEstimate = acftTotal != null ? (acftTotal / 600) * physicalMax : 0;
  const leadershipEstimate =
    leadershipEval != null ? (leadershipEval / 100) * leadershipMax : 0;

  const recentHistory = scores.scoreHistory.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header} accessibilityRole="header">
          Mission Profile
        </Text>

        {/* Score Gauge */}
        <View style={styles.gaugeContainer}>
          <VConicGauge
            progress={gaugeProgress}
            size={160}
            strokeWidth={14}
            label={gaugeLabel}
            accessibilityLabel={
              totalOml != null
                ? `Projected OML Score: ${Math.round(totalOml)} out of 1000`
                : 'OML Score not yet calculated'
            }
          />
          <Text style={styles.gaugeSubtitle}>Projected OML</Text>
        </View>

        {/* Pillar Progress Bars */}
        <Text style={styles.sectionTitle}>Pillar Breakdown</Text>
        <VCard tier="low" style={styles.pillarCard}>
          <View style={styles.pillarRow}>
            <Text style={styles.pillarLabel}>Academic</Text>
            <Text style={styles.pillarValue}>
              {gpa != null ? `${Math.round(academicEstimate)}/${academicMax}` : '--/400'}
            </Text>
          </View>
          <VProgressBar
            progress={gpa != null ? academicEstimate / academicMax : 0}
            accessibilityLabel={`Academic pillar: ${gpa != null ? Math.round(academicEstimate) : 0} of ${academicMax}`}
          />
        </VCard>
        <VCard tier="low" style={styles.pillarCard}>
          <View style={styles.pillarRow}>
            <Text style={styles.pillarLabel}>Leadership</Text>
            <Text style={styles.pillarValue}>
              {leadershipEval != null
                ? `${Math.round(leadershipEstimate)}/${leadershipMax}`
                : '--/400'}
            </Text>
          </View>
          <VProgressBar
            progress={leadershipEval != null ? leadershipEstimate / leadershipMax : 0}
            accessibilityLabel={`Leadership pillar: ${leadershipEval != null ? Math.round(leadershipEstimate) : 0} of ${leadershipMax}`}
          />
        </VCard>
        <VCard tier="low" style={styles.pillarCard}>
          <View style={styles.pillarRow}>
            <Text style={styles.pillarLabel}>Physical</Text>
            <Text style={styles.pillarValue}>
              {acftTotal != null
                ? `${Math.round(physicalEstimate)}/${physicalMax}`
                : '--/200'}
            </Text>
          </View>
          <VProgressBar
            progress={acftTotal != null ? physicalEstimate / physicalMax : 0}
            accessibilityLabel={`Physical pillar: ${acftTotal != null ? Math.round(physicalEstimate) : 0} of ${physicalMax}`}
          />
        </VCard>

        {/* Active Goals Section */}
        <View style={styles.goalsSectionHeader}>
          <Text style={styles.sectionTitle}>
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
                category={goal.category}
                currentValue={goal.currentValue}
                targetValue={goal.targetValue}
                deadline={goal.deadline}
                omlImpact={goal.omlImpact}
                createdBy={goal.createdBy}
                status={goal.status}
                onPress={() => router.push(`/goal/${goal.id}`)}
                style={styles.goalCard}
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

        {/* Recent Activity */}
        {recentHistory.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <VCard tier="low">
              <View style={styles.activityList}>
                {recentHistory.map((entry, i) => (
                  <VActivityItem
                    key={entry.id ?? i}
                    title={`OML: ${entry.total_oml != null ? Math.round(entry.total_oml) : '--'}`}
                    subtitle={`GPA: ${entry.gpa?.toFixed(2) ?? '--'} | ACFT: ${entry.acft_total != null ? Math.round(entry.acft_total) : '--'}`}
                    timestamp={entry.recorded_at ?? ''}
                  />
                ))}
              </View>
            </VCard>
          </>
        )}

        {/* Goal Target */}
        {profile.goalOml != null && (
          <VCard tier="high" style={styles.goalTargetCard}>
            <Text style={styles.goalTargetTitle}>
              Target: {Math.round(profile.goalOml)} OML
            </Text>
            <Text style={styles.goalTargetDesc}>
              {totalOml != null
                ? totalOml >= profile.goalOml
                  ? 'You are on track to meet your goal!'
                  : `${Math.round(profile.goalOml - totalOml)} points to go.`
                : 'Enter scores to see how close you are.'}
            </Text>
          </VCard>
        )}
      </ScrollView>

      {/* Add Goal Modal */}
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

            {/* Category picker */}
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

            {/* Title */}
            <Text style={styles.fieldLabel}>Goal Title</Text>
            <TextInput
              style={styles.textInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Improve ACFT to 550"
              placeholderTextColor={colors.outline}
              accessibilityLabel="Goal title input"
            />

            {/* Target value */}
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

            {/* Deadline */}
            <Text style={styles.fieldLabel}>Deadline (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              value={newDeadline}
              onChangeText={setNewDeadline}
              placeholder="2026-05-01"
              placeholderTextColor={colors.outline}
              accessibilityLabel="Deadline input"
            />

            {/* Create button */}
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
  header: {
    ...typography.headline_lg,
    color: colors.on_surface,
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  gaugeSubtitle: {
    ...typography.label_md,
    color: colors.outline,
    marginTop: spacing[2],
  },
  sectionTitle: {
    ...typography.title_md,
    color: colors.on_surface,
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  pillarCard: {
    marginBottom: spacing[3],
  },
  pillarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  pillarLabel: {
    ...typography.title_sm,
    color: colors.on_surface,
  },
  pillarValue: {
    ...typography.label_md,
    color: colors.outline,
  },
  // Goals section
  goalsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[3],
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
  },
  goalCard: {
    // Individual goal card spacing handled by gap
  },
  goalsEmpty: {
    paddingVertical: spacing[8],
    minHeight: 200,
  },
  activityList: {
    gap: spacing[1],
  },
  goalTargetCard: {
    marginTop: spacing[4],
  },
  goalTargetTitle: {
    ...typography.title_sm,
    color: colors.tertiary,
    marginBottom: spacing[1],
  },
  goalTargetDesc: {
    ...typography.body_sm,
    color: colors.on_surface,
  },
  // Modal styles
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
    // No border — Rule 1
  },
  categoryOptionSelected: {
    backgroundColor: `rgba(204, 167, 48, 0.12)`, // tertiary_container at low opacity
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
    // No border — Rule 1
  },
  createButton: {
    marginTop: spacing[6],
  },
});
