import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VCard, VButton, VConicGauge, VProgressBar, VRankBadge } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import { useGoalsStore } from '../../src/stores/goals';
import {
  getGoalProgressLog,
  updateGoal,
  type GoalProgressLogRow,
} from '../../src/services/storage';

const isWeb = Platform.OS === 'web';

const categoryIcons: Record<string, string> = {
  acft: '\u{1F4AA}',
  gpa: '\u{1F4DA}',
  leadership: '\u{1F396}\uFE0F',
  oml: '\u{1F4CA}',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  expired: 'Expired',
  paused: 'Paused',
};

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [progressLog, setProgressLog] = useState<GoalProgressLogRow[]>([]);

  const goals = useGoalsStore((s) => s.goals);
  const isLoaded = useGoalsStore((s) => s.isLoaded);
  const loadGoals = useGoalsStore((s) => s.loadFromSQLite);
  const removeGoal = useGoalsStore((s) => s.removeGoal);

  const goalId = id ? parseInt(id, 10) : NaN;
  const goal = !isNaN(goalId) ? goals.find((g) => g.id === goalId) : undefined;

  // Ensure goals are loaded
  useEffect(() => {
    if (!isLoaded) {
      loadGoals();
    }
  }, [isLoaded, loadGoals]);

  // Load progress history
  const loadProgressLog = useCallback(async () => {
    if (isNaN(goalId) || isWeb) return;
    try {
      const log = await getGoalProgressLog(goalId);
      setProgressLog(log);
    } catch (error) {
      console.error('Failed to load progress log:', error);
    }
  }, [goalId]);

  useEffect(() => {
    loadProgressLog();
  }, [loadProgressLog]);

  const statusColors: Record<string, string> = {
    active: colors.primary,
    completed: colors.tertiary,
    expired: colors.error,
    paused: colors.outline,
  };

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyBody, { color: colors.outline }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{'\u{1F3AF}'}</Text>
          <Text style={[styles.emptyHeadline, { color: colors.on_surface }]}>Goal Not Found</Text>
          <Text style={[styles.emptyBody, { color: colors.outline }]}>
            This goal may have been deleted or hasn't been created yet.
          </Text>
          <VButton
            label="Back to Dashboard"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.backButton}
            accessibilityLabel="Go back to dashboard"
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentValue = goal.current_value ?? goal.baseline_value;
  const targetValue = goal.target_value;
  const progress = targetValue > 0 ? Math.min(1, currentValue / targetValue) : 0;
  const percentText = `${Math.round(progress * 100)}%`;
  const icon = categoryIcons[goal.category] ?? '\u{1F4CA}';
  const isCompleted = goal.status === 'completed';

  const currentDisplay = currentValue % 1 === 0 ? String(Math.round(currentValue)) : currentValue.toFixed(2);
  const targetDisplay = targetValue % 1 === 0 ? String(Math.round(targetValue)) : targetValue.toFixed(2);

  async function handlePause() {
    const isPaused = goal!.status === 'paused';
    const newStatus = isPaused ? 'active' : 'paused';

    Alert.alert(
      isPaused ? 'Resume Goal' : 'Pause Goal',
      isPaused
        ? 'This will reactivate your goal.'
        : 'You can resume this goal anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isPaused ? 'Resume' : 'Pause',
          onPress: async () => {
            try {
              if (!isWeb && goal!.id != null) {
                await updateGoal(goal!.id, { status: newStatus });
              }
              // Reload goals from storage to reflect the change
              await loadGoals();
              Alert.alert('Done', `Goal ${isPaused ? 'resumed' : 'paused'}.`);
            } catch (error) {
              console.error('Failed to update goal status:', error);
              Alert.alert('Error', 'Failed to update goal. Please try again.');
            }
          },
        },
      ],
    );
  }

  function handleDelete() {
    Alert.alert(
      'Delete Goal',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (goal!.id != null) {
                await removeGoal(goal!.id);
              }
              router.back();
            } catch (error) {
              console.error('Failed to delete goal:', error);
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <View style={styles.headerRow}>
          <VButton
            label="Back"
            onPress={() => router.back()}
            variant="tertiary"
            accessibilityLabel="Go back"
          />
        </View>

        {/* Goal title + category + status */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.categoryIcon}>{icon}</Text>
            <Text style={[styles.title, { color: colors.on_surface }]}>{goal.title}</Text>
          </View>
          <View style={styles.badgeRow}>
            <VRankBadge
              rank={statusLabels[goal.status] ?? goal.status}
              style={{
                ...styles.statusBadge,
                backgroundColor: `${statusColors[goal.status] ?? colors.outline}20`,
              }}
              accessibilityLabel={`Status: ${statusLabels[goal.status] ?? goal.status}`}
            />
            {goal.created_by === 'ai' && (
              <VRankBadge
                rank="AI Coach"
                accessibilityLabel="Created by AI Coach"
              />
            )}
          </View>
        </View>

        {/* Large progress gauge */}
        <View style={styles.gaugeSection}>
          <VConicGauge
            progress={progress}
            size={180}
            strokeWidth={16}
            label={percentText}
            accessibilityLabel={`Goal progress: ${percentText}`}
          />
        </View>

        {/* Current vs target */}
        <VCard tier="lowest" style={styles.valuesCard}>
          <View style={styles.valuesRow}>
            <View style={styles.valueBlock}>
              <Text style={[styles.valueNumber, { color: colors.on_surface }]}>{currentDisplay}</Text>
              <Text style={[styles.valueLabel, { color: colors.outline }]}>Current</Text>
            </View>
            <Text style={[styles.valueDivider, { color: colors.outline }]}>/</Text>
            <View style={styles.valueBlock}>
              <Text style={[styles.valueNumber, { color: colors.on_surface }]}>{targetDisplay}</Text>
              <Text style={[styles.valueLabel, { color: colors.outline }]}>Target</Text>
            </View>
          </View>
          {goal.oml_impact != null && goal.oml_impact > 0 && (
            <Text style={[styles.omlImpactText, { color: colors.tertiary }]}>
              +{goal.oml_impact} OML points when complete
            </Text>
          )}
          <VProgressBar
            progress={progress}
            height={8}
            style={styles.detailProgressBar}
            accessibilityLabel={`Progress: ${percentText}`}
          />
        </VCard>

        {/* Progress History */}
        <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>Progress History</Text>
        <VCard tier="low" style={styles.historyCard}>
          {progressLog.length > 0 ? (
            progressLog.map((entry, idx) => {
              const date = entry.logged_at
                ? new Date(entry.logged_at).toLocaleDateString()
                : `Entry ${idx + 1}`;
              const val = entry.value % 1 === 0
                ? String(Math.round(entry.value))
                : entry.value.toFixed(2);
              return (
                <View key={entry.id ?? idx} style={styles.historyRow}>
                  <Text style={[styles.historyDate, { color: colors.outline }]}>{date}</Text>
                  <Text style={[styles.historyValue, { color: colors.on_surface }]}>{val}</Text>
                </View>
              );
            })
          ) : (
            <>
              <Text style={[styles.placeholderText, { color: colors.on_surface }]}>
                No progress logged yet
              </Text>
              <Text style={[styles.placeholderSubtext, { color: colors.outline }]}>
                Your progress will appear here as you log new scores.
              </Text>
            </>
          )}
        </VCard>

        {/* Deadline */}
        <VCard tier="low" style={styles.historyCard}>
          <View style={styles.historyRow}>
            <Text style={[styles.historyDate, { color: colors.outline }]}>Deadline</Text>
            <Text style={[styles.historyValue, { color: colors.on_surface }]}>
              {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : '--'}
            </Text>
          </View>
          <View style={styles.historyRow}>
            <Text style={[styles.historyDate, { color: colors.outline }]}>Baseline</Text>
            <Text style={[styles.historyValue, { color: colors.on_surface }]}>
              {goal.baseline_value % 1 === 0 ? String(Math.round(goal.baseline_value)) : goal.baseline_value.toFixed(2)}
            </Text>
          </View>
          <View style={styles.historyRow}>
            <Text style={[styles.historyDate, { color: colors.outline }]}>Category</Text>
            <Text style={[styles.historyValue, { color: colors.on_surface }]}>
              {goal.category}
            </Text>
          </View>
        </VCard>

        {/* Actions */}
        {!isCompleted && (
          <View style={styles.actionsSection}>
            <VButton
              label={goal.status === 'paused' ? 'Resume Goal' : 'Pause Goal'}
              onPress={handlePause}
              variant="secondary"
              style={styles.actionButton}
              accessibilityLabel={goal.status === 'paused' ? 'Resume this goal' : 'Pause this goal'}
            />
            <VButton
              label="Delete Goal"
              onPress={handleDelete}
              variant="tertiary"
              style={styles.actionButton}
              accessibilityLabel="Delete this goal permanently"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    justifyContent: 'flex-start',
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
  titleSection: {
    marginBottom: spacing[4],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  categoryIcon: {
    fontSize: 28,
  },
  title: {
    ...typography.headline_sm,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  gaugeSection: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  valuesCard: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  valueBlock: {
    alignItems: 'center',
  },
  valueNumber: {
    ...typography.headline_md,
  },
  valueLabel: {
    ...typography.label_sm,
    marginTop: spacing[1],
  },
  valueDivider: {
    ...typography.headline_md,
  },
  omlImpactText: {
    ...typography.label_md,
    marginBottom: spacing[3],
  },
  detailProgressBar: {
    marginTop: spacing[2],
  },
  sectionTitle: {
    ...typography.title_md,
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  historyCard: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  historyDate: {
    ...typography.label_sm,
  },
  historyValue: {
    ...typography.title_sm,
  },
  placeholderText: {
    ...typography.body_md,
    textAlign: 'center',
  },
  placeholderSubtext: {
    ...typography.body_sm,
    textAlign: 'center',
    marginTop: spacing[1],
  },
  actionsSection: {
    marginTop: spacing[6],
    gap: spacing[3],
  },
  actionButton: {
    minHeight: 48,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    gap: spacing[3],
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyHeadline: {
    ...typography.headline_sm,
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.body_md,
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing[4],
  },
});
