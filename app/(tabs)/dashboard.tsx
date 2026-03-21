import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  VConicGauge,
  VProgressBar,
  VCard,
  VActivityItem,
  VSkeletonLoader,
  VEmptyState,
} from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import { useProfileStore } from '../../src/stores/useProfileStore';
import { useScoresStore } from '../../src/stores/useScoresStore';
import { calculateOML } from '../../src/engine/oml';
import { getCachedBriefing } from '../../src/services/storage';

export default function DashboardScreen() {
  const profile = useProfileStore((s) => s.profile);
  const profileLoaded = useProfileStore((s) => s.loaded);
  const { academic, physical, leadership, loaded: scoresLoaded } = useScoresStore();
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const omlResult = calculateOML(profile, academic, physical, leadership);

  useEffect(() => {
    const cached = getCachedBriefing();
    if (cached) {
      // Extract first sentence as a short insight
      const firstSentence = cached.split(/[.!?]/)[0];
      setAiInsight(firstSentence ? firstSentence + '.' : null);
    }
  }, []);

  if (!profileLoaded || !scoresLoaded) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <VSkeletonLoader height={180} borderRadius={90} style={{ alignSelf: 'center', width: 180 }} />
          <VSkeletonLoader lines={3} style={{ marginTop: spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  // Build activity items from recent data
  const activities: Array<{
    id: string;
    title: string;
    subtitle: string;
    timestamp: string;
    delta?: number;
  }> = [];

  if (academic.courses.length > 0) {
    const latestCourse = academic.courses[0];
    activities.push({
      id: `course_${latestCourse.id}`,
      title: 'Course Added',
      subtitle: `${latestCourse.code} — ${latestCourse.grade}`,
      timestamp: 'Recent',
    });
  }

  if (physical.assessmentHistory.length > 0) {
    const latest = physical.assessmentHistory[0];
    const previous = physical.assessmentHistory[1];
    activities.push({
      id: `acft_${latest.id}`,
      title: 'ACFT Recorded',
      subtitle: `Score: ${latest.totalScore}/600`,
      timestamp: latest.date,
      delta: previous ? latest.totalScore - previous.totalScore : undefined,
    });
  }

  if (leadership.roles.length > 0) {
    const latestRole = leadership.roles.find((r) => r.active) || leadership.roles[0];
    activities.push({
      id: `role_${latestRole.id}`,
      title: 'Leadership Role',
      subtitle: latestRole.title,
      timestamp: latestRole.startDate,
    });
  }

  const hasData = academic.gpa > 0 || physical.totalScore > 0 || leadership.totalScore > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>OML Dashboard</Text>

        {!hasData ? (
          <VEmptyState
            icon="dashboard"
            title="No data yet"
            subtitle="Add your GPA, ACFT scores, and leadership roles to see your OML projection."
          />
        ) : (
          <>
            {/* OML Gauge */}
            <VConicGauge
              value={omlResult.totalScore}
              max={omlResult.maxScore}
              label="Projected OML"
              subtitle={`${omlResult.percentile}th percentile`}
              size={200}
              color={colors.primary}
              style={styles.gauge}
            />

            {/* Pillar Progress Bars */}
            <VCard variant="filled" style={styles.pillarsCard}>
              <Text style={styles.sectionLabel}>Pillar Breakdown</Text>
              <VProgressBar
                label="Academic"
                value={omlResult.academic.weighted}
                max={40}
                color={colors.primary}
              />
              <VProgressBar
                label="Leadership"
                value={omlResult.leadership.weighted}
                max={40}
                color={colors.tertiary}
              />
              <VProgressBar
                label="Physical"
                value={omlResult.physical.weighted}
                max={20}
                color={colors.gold}
              />
            </VCard>

            {/* AI Insight */}
            {aiInsight && (
              <VCard variant="outlined" style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <MaterialIcons name="psychology" size={18} color={colors.primary} />
                  <Text style={styles.insightLabel}>AI Insight</Text>
                </View>
                <Text style={styles.insightText}>{aiInsight}</Text>
              </VCard>
            )}

            {/* Activity Log */}
            {activities.length > 0 && (
              <VCard variant="filled" style={styles.activityCard}>
                <Text style={styles.sectionLabel}>Recent Activity</Text>
                {activities.map((activity) => (
                  <VActivityItem
                    key={activity.id}
                    title={activity.title}
                    subtitle={activity.subtitle}
                    timestamp={activity.timestamp}
                    delta={activity.delta}
                  />
                ))}
              </VCard>
            )}
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
  loadingContainer: {
    padding: spacing.md,
  },
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  title: {
    ...typography.headlineMedium,
    color: colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  gauge: {
    marginVertical: spacing.lg,
  },
  pillarsCard: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.titleSmall,
    color: colors.onSurface,
    marginBottom: spacing.sm + 4,
  },
  insightCard: {
    marginBottom: spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  insightLabel: {
    ...typography.labelMedium,
    color: colors.primary,
  },
  insightText: {
    ...typography.bodyMedium,
    color: colors.onSurface,
  },
  activityCard: {
    marginBottom: spacing.md,
  },
});
