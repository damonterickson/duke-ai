import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { VCard, VButton, VConicGauge, VProgressBar, VRankBadge } from '../../src/components';
import { colors, typography, spacing, roundness } from '../../src/theme/tokens';

// Mock goal data — will be replaced with real store lookup after merge
const MOCK_GOALS: Record<string, {
  id: string;
  title: string;
  category: 'gpa' | 'acft' | 'leadership' | 'oml';
  currentValue: number;
  targetValue: number;
  baselineValue: number;
  deadline: string;
  omlImpact?: number;
  createdBy: 'user' | 'ai';
  status: 'active' | 'completed' | 'expired' | 'paused';
  createdAt: string;
}> = {};

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

const statusColors: Record<string, string> = {
  active: colors.primary,
  completed: colors.tertiary,
  expired: colors.error,
  paused: colors.outline,
};

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isPausing, setIsPausing] = useState(false);

  // Will be replaced with store lookup: useGoalsStore((s) => s.goals.find(g => g.id === id))
  const goal = id ? MOCK_GOALS[id] : undefined;

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{'\u{1F3AF}'}</Text>
          <Text style={styles.emptyHeadline}>Goal Not Found</Text>
          <Text style={styles.emptyBody}>
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

  // Safe to access — we returned early above if goal is undefined
  const g = goal!;
  const progress = g.targetValue > 0 ? Math.min(1, g.currentValue / g.targetValue) : 0;
  const percentText = `${Math.round(progress * 100)}%`;
  const icon = categoryIcons[g.category] ?? '\u{1F4CA}';
  const isCompleted = g.status === 'completed';

  const currentDisplay = g.currentValue % 1 === 0 ? String(Math.round(g.currentValue)) : g.currentValue.toFixed(2);
  const targetDisplay = g.targetValue % 1 === 0 ? String(Math.round(g.targetValue)) : g.targetValue.toFixed(2);

  function handlePause() {
    Alert.alert(
      g.status === 'paused' ? 'Resume Goal' : 'Pause Goal',
      g.status === 'paused'
        ? 'This will reactivate your goal.'
        : 'You can resume this goal anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: g.status === 'paused' ? 'Resume' : 'Pause',
          onPress: () => {
            // TODO: update goal status in store after merge
            setIsPausing(true);
            Alert.alert('Done', `Goal ${g.status === 'paused' ? 'resumed' : 'paused'}.`);
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
          onPress: () => {
            // TODO: delete goal from store after merge
            router.back();
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
            <Text style={styles.title}>{g.title}</Text>
          </View>
          <View style={styles.badgeRow}>
            <VRankBadge
              rank={statusLabels[g.status]}
              style={{
                ...styles.statusBadge,
                backgroundColor: `${statusColors[g.status]}20`,
              }}
              accessibilityLabel={`Status: ${statusLabels[g.status]}`}
            />
            {g.createdBy === 'ai' && (
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
              <Text style={styles.valueNumber}>{currentDisplay}</Text>
              <Text style={styles.valueLabel}>Current</Text>
            </View>
            <Text style={styles.valueDivider}>/</Text>
            <View style={styles.valueBlock}>
              <Text style={styles.valueNumber}>{targetDisplay}</Text>
              <Text style={styles.valueLabel}>Target</Text>
            </View>
          </View>
          {g.omlImpact != null && g.omlImpact > 0 && (
            <Text style={styles.omlImpactText}>
              +{g.omlImpact} OML points when complete
            </Text>
          )}
          <VProgressBar
            progress={progress}
            height={8}
            style={styles.detailProgressBar}
            accessibilityLabel={`Progress: ${percentText}`}
          />
        </VCard>

        {/* Progress history placeholder */}
        <Text style={styles.sectionTitle}>Progress History</Text>
        <VCard tier="low" style={styles.historyCard}>
          <Text style={styles.placeholderText}>
            Keep logging to see your trend
          </Text>
          <Text style={styles.placeholderSubtext}>
            Your progress will be charted here as you log new scores.
          </Text>
        </VCard>

        {/* AI Insights placeholder */}
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <VCard tier="low" style={styles.insightsCard}>
          <Text style={styles.insightIcon}>{'\u{1F916}'}</Text>
          <Text style={styles.placeholderText}>
            AI Coach will share insights on your next briefing
          </Text>
          <Text style={styles.placeholderSubtext}>
            Personalized tips and strategies will appear here after your next conversation with Vanguard AI.
          </Text>
        </VCard>

        {/* Actions */}
        {!isCompleted && (
          <View style={styles.actionsSection}>
            <VButton
              label={g.status === 'paused' ? 'Resume Goal' : 'Pause Goal'}
              onPress={handlePause}
              variant="secondary"
              style={styles.actionButton}
              accessibilityLabel={g.status === 'paused' ? 'Resume this goal' : 'Pause this goal'}
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
    color: colors.on_surface,
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
    color: colors.on_surface,
  },
  valueLabel: {
    ...typography.label_sm,
    color: colors.outline,
    marginTop: spacing[1],
  },
  valueDivider: {
    ...typography.headline_md,
    color: colors.outline,
  },
  omlImpactText: {
    ...typography.label_md,
    color: colors.tertiary,
    marginBottom: spacing[3],
  },
  detailProgressBar: {
    marginTop: spacing[2],
  },
  sectionTitle: {
    ...typography.title_md,
    color: colors.on_surface,
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },
  historyCard: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  insightsCard: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  insightIcon: {
    fontSize: 32,
    marginBottom: spacing[1],
  },
  placeholderText: {
    ...typography.body_md,
    color: colors.on_surface,
    textAlign: 'center',
  },
  placeholderSubtext: {
    ...typography.body_sm,
    color: colors.outline,
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
    color: colors.on_surface,
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.body_md,
    color: colors.outline,
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing[4],
  },
});
