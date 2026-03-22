import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { VCard } from './VCard';
import { VProgressBar } from './VProgressBar';
import { VRankBadge } from './VRankBadge';
import { colors, typography, spacing, roundness } from '../theme/tokens';

export interface VGoalCardProps {
  title: string;
  category: 'gpa' | 'acft' | 'leadership' | 'oml';
  currentValue: number;
  targetValue: number;
  deadline: string;
  omlImpact?: number;
  createdBy: 'user' | 'ai';
  status: 'active' | 'completed' | 'expired' | 'paused';
  onPress?: () => void;
  style?: ViewStyle;
}

const categoryIcons: Record<VGoalCardProps['category'], string> = {
  acft: '\u{1F4AA}',
  gpa: '\u{1F4DA}',
  leadership: '\u{1F396}\uFE0F',
  oml: '\u{1F4CA}',
};

const categoryLabels: Record<VGoalCardProps['category'], string> = {
  acft: 'ACFT',
  gpa: 'GPA',
  leadership: 'Leadership',
  oml: 'OML',
};

function formatDeadline(deadline: string): string {
  try {
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return deadline;
  }
}

function formatDelta(current: number, target: number): string {
  const delta = target - current;
  if (delta <= 0) return 'Goal reached';
  // Use reasonable precision based on magnitude
  if (delta < 1) return `${delta.toFixed(2)} to go`;
  return `${Math.round(delta)} to go`;
}

export const VGoalCard: React.FC<VGoalCardProps> = ({
  title,
  category,
  currentValue,
  targetValue,
  deadline,
  omlImpact,
  createdBy,
  status,
  onPress,
  style,
}) => {
  const progress = targetValue > 0 ? Math.min(1, currentValue / targetValue) : 0;
  const isCompleted = status === 'completed';
  const icon = categoryIcons[category];
  const percentText = `${Math.round(progress * 100)}%`;

  // Format values for display
  const currentDisplay = currentValue % 1 === 0 ? String(Math.round(currentValue)) : currentValue.toFixed(2);
  const targetDisplay = targetValue % 1 === 0 ? String(Math.round(targetValue)) : targetValue.toFixed(2);

  const a11yLabel = `${categoryLabels[category]} goal: ${title}. ${currentDisplay} of ${targetDisplay}, ${percentText} complete. Due ${formatDeadline(deadline)}.${omlImpact ? ` Plus ${omlImpact} OML points.` : ''}${createdBy === 'ai' ? ' Created by AI Coach.' : ''}${isCompleted ? ' Completed.' : ''}`;

  const cardContent = (
    <VCard
      tier="lowest"
      style={{
        ...styles.card,
        ...(isCompleted ? styles.completedCard : undefined),
        ...style,
      }}
      accessibilityLabel={a11yLabel}
    >
      {/* Top row: icon + title + AI badge + completion badge */}
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Text style={styles.categoryIcon}>{icon}</Text>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
        <View style={styles.badges}>
          {createdBy === 'ai' && (
            <VRankBadge
              rank="AI"
              accessibilityLabel="Created by AI Coach"
              style={styles.aiBadge}
            />
          )}
          {isCompleted && (
            <Text style={styles.trophyBadge} accessibilityLabel="Goal completed">{'\u{1F3C6}'}</Text>
          )}
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <VProgressBar
          progress={progress}
          height={6}
          accessibilityLabel={`${title} progress: ${percentText}`}
        />
      </View>

      {/* Bottom row: values + deadline + OML impact */}
      <View style={styles.bottomRow}>
        <Text style={styles.valueText}>
          {currentDisplay}/{targetDisplay} — {formatDelta(currentValue, targetValue)}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.deadlineText}>
            Due {formatDeadline(deadline)}
          </Text>
          {omlImpact != null && omlImpact > 0 && (
            <Text style={styles.omlImpact}>
              +{omlImpact} OML pts
            </Text>
          )}
        </View>
      </View>
    </VCard>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        style={({ pressed }) => [pressed && { opacity: 0.85 }, { minHeight: 44 }]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    // No border — Rule 1
  },
  completedCard: {
    backgroundColor: `rgba(204, 167, 48, 0.08)`, // tertiary_container at low opacity
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing[2],
  },
  categoryIcon: {
    fontSize: 18,
  },
  title: {
    ...typography.title_sm,
    color: colors.on_surface,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginLeft: spacing[2],
  },
  aiBadge: {
    alignSelf: 'center',
  },
  trophyBadge: {
    fontSize: 18,
  },
  progressContainer: {
    marginTop: spacing[3],
    marginBottom: spacing[3],
  },
  bottomRow: {
    gap: spacing[1],
  },
  valueText: {
    ...typography.label_md,
    color: colors.on_surface,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineText: {
    ...typography.label_sm,
    color: colors.outline,
  },
  omlImpact: {
    ...typography.label_sm,
    color: colors.tertiary,
  },
});
