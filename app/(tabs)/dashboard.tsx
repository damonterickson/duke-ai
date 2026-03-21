import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  VConicGauge,
  VProgressBar,
  VCard,
  VActivityItem,
  VEmptyState,
  VSkeletonLoader,
} from '../../src/components';
import { colors, typography, spacing } from '../../src/theme/tokens';
import { useScoresStore } from '../../src/stores/scores';
import { useProfileStore } from '../../src/stores/profile';

export default function DashboardScreen() {
  const router = useRouter();
  const scores = useScoresStore();
  const profile = useProfileStore();
  const isLoaded = scores.isLoaded;

  const latestScore = scores.scoreHistory[0];
  const totalOml = latestScore?.total_oml ?? null;
  const gpa = latestScore?.gpa ?? null;
  const acftTotal = latestScore?.acft_total ?? null;
  const leadershipEval = latestScore?.leadership_eval ?? null;

  // Pillar maxes: Academic 400, Leadership 400, Physical 200 (per OML formula)
  const academicMax = 400;
  const leadershipMax = 400;
  const physicalMax = 200;

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
          <VCard tier="high" style={styles.goalCard}>
            <Text style={styles.goalTitle}>
              Target: {Math.round(profile.goalOml)} OML
            </Text>
            <Text style={styles.goalDesc}>
              {totalOml != null
                ? totalOml >= profile.goalOml
                  ? 'You are on track to meet your goal!'
                  : `${Math.round(profile.goalOml - totalOml)} points to go.`
                : 'Enter scores to see how close you are.'}
            </Text>
          </VCard>
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
  activityList: {
    gap: spacing[1],
  },
  goalCard: {
    marginTop: spacing[4],
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
