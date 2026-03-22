import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { VConicGauge, VGlassPanel, VProgressBar } from '../../src/components';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import { useProfileStore } from '../../src/stores/profile';
import { useScoresStore } from '../../src/stores/scores';
import { useEngagementStore } from '../../src/stores/engagement';
import { useSquadStore } from '../../src/stores/squad';
import { calculateOML } from '../../src/engine/oml';
import type { CadetProfile } from '../../src/engine/oml';
import omlConfig from '../../src/data/oml-config.json';
import acftTables from '../../src/data/acft-tables.json';

export default function MissionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const engagement = useEngagementStore();
  const squad = useSquadStore();

  const headerBg = isDark ? colors.surface_container_high : '#343c0a';
  const latestScore = scores.scoreHistory[0];

  // Build OML from profile + scores
  const omlResult = useMemo(() => {
    if (!profile.yearGroup || !profile.gender || !profile.ageBracket) return null;
    const cadet: CadetProfile = {
      gpa: latestScore?.gpa ?? 0,
      mslGpa: latestScore?.msl_gpa ?? 0,
      acftScores: {},
      leadershipEval: latestScore?.leadership_eval ?? 0,
      cstScore: latestScore?.cst_score ?? undefined,
      clcScore: latestScore?.clc_score ?? undefined,
      commandRoles: [],
      extracurricularHours: 0,
      yearGroup: profile.yearGroup,
      gender: profile.gender,
      ageBracket: profile.ageBracket,
    };
    try {
      return calculateOML(cadet, omlConfig as any, acftTables as any);
    } catch {
      return null;
    }
  }, [profile, latestScore]);

  const omlTotal = omlResult?.totalScore ?? latestScore?.total_oml ?? 0;
  const omlProgress = Math.min(omlTotal / 1000, 1);
  const percentile = squad.totalCadets > 0
    ? Math.round(((squad.totalCadets - squad.individualRank) / squad.totalCadets) * 100)
    : 0;

  const mission = engagement.activeMission;
  const topBranch = engagement.branchFit[0];

  // Pillar scores (normalized 0-1)
  const physical = latestScore?.acft_total ? Math.min(latestScore.acft_total / 600, 1) : 0;
  const academic = latestScore?.gpa ? Math.min(latestScore.gpa / 4.0, 1) : 0;
  const leadership = latestScore?.leadership_eval ? Math.min(latestScore.leadership_eval / 100, 1) : 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: headerBg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Text style={styles.headerText}>DUKE VANGUARD</Text>
        <TouchableOpacity onPress={() => router.push('/profile')} accessibilityLabel="Settings">
          <MaterialIcons name="settings" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* OML Performance Ring */}
        <View style={styles.gaugeSection}>
          <VConicGauge
            progress={omlProgress}
            size={160}
            strokeWidth={12}
            label={omlTotal > 0 ? String(Math.round(omlTotal)) : '--'}
            sublabel="OML Score"
          />
          <View style={styles.gaugeInfo}>
            <Text style={[styles.percentileText, { color: colors.on_surface }]}>
              {percentile > 0 ? `Top ${100 - percentile}%` : '--'}
            </Text>
            <Text style={[styles.tierText, { color: colors.outline }]}>
              {engagement.tier}
            </Text>
          </View>
        </View>

        {/* Active Mission Card */}
        <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>Active Mission</Text>
        <VGlassPanel style={styles.missionCard}>
          {mission ? (
            <>
              <Text style={[styles.missionTitle, { color: colors.on_surface }]}>{mission.title}</Text>
              <Text style={[styles.missionLocation, { color: colors.outline }]}>{mission.location}</Text>
              <Text style={[styles.missionDesc, { color: colors.on_surface }]}>{mission.description}</Text>
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
                accessibilityLabel="Accept Brief"
              >
                <Text style={[styles.acceptBtnText, { color: colors.on_primary }]}>Accept Brief</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={[styles.emptyText, { color: colors.outline }]}>
              Complete your profile to get daily missions.
            </Text>
          )}
        </VGlassPanel>

        {/* Achievement Grid */}
        <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>Achievements</Text>
        <View style={styles.achievementRow}>
          <View style={[styles.achieveCard, { backgroundColor: colors.surface_container }]}>
            <MaterialIcons name="local-fire-department" size={24} color={colors.primary} />
            <Text style={[styles.achieveValue, { color: colors.on_surface }]}>{engagement.streak}</Text>
            <Text style={[styles.achieveLabel, { color: colors.outline }]}>Streak</Text>
          </View>
          <View style={[styles.achieveCard, { backgroundColor: colors.surface_container }]}>
            <MaterialIcons name="trending-up" size={24} color={colors.primary} />
            <Text style={[styles.achieveValue, { color: colors.on_surface }]}>
              {squad.totalCadets > 0 ? `Top ${Math.round((squad.individualRank / squad.totalCadets) * 100)}%` : '--'}
            </Text>
            <Text style={[styles.achieveLabel, { color: colors.outline }]}>Ranking</Text>
          </View>
          <View style={[styles.achieveCard, { backgroundColor: colors.surface_container }]}>
            <MaterialIcons name="my-location" size={24} color={colors.primary} />
            <Text style={[styles.achieveValue, { color: colors.on_surface }]}>
              {topBranch ? topBranch.branch : '--'}
            </Text>
            <Text style={[styles.achieveLabel, { color: colors.outline }]}>
              {topBranch ? `${topBranch.percentage}% Fit` : 'Set up profile'}
            </Text>
          </View>
        </View>

        {/* Strategic Readiness */}
        <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>Strategic Readiness</Text>
        <View style={styles.readinessRow}>
          <Text style={[styles.readinessLabel, { color: colors.on_surface }]}>Physical</Text>
          <VProgressBar progress={physical} />
        </View>
        <View style={styles.readinessRow}>
          <Text style={[styles.readinessLabel, { color: colors.on_surface }]}>Academic</Text>
          <VProgressBar progress={academic} />
        </View>
        <View style={styles.readinessRow}>
          <Text style={[styles.readinessLabel, { color: colors.on_surface }]}>Leadership</Text>
          <VProgressBar progress={leadership} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  headerText: {
    ...typography.title_md,
    color: '#ffffff',
    letterSpacing: 2,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  content: { padding: spacing[4], paddingBottom: spacing[16] },
  gaugeSection: { alignItems: 'center', marginBottom: spacing[6] },
  gaugeInfo: { alignItems: 'center', marginTop: spacing[2] },
  percentileText: { ...typography.title_sm },
  tierText: { ...typography.label_sm, textTransform: 'uppercase', letterSpacing: 1 },
  sectionTitle: { ...typography.title_md, marginBottom: spacing[3], marginTop: spacing[2] },
  missionCard: { marginBottom: spacing[4] },
  missionTitle: { ...typography.title_md, marginBottom: spacing[1] },
  missionLocation: { ...typography.label_sm, marginBottom: spacing[2] },
  missionDesc: { ...typography.body_md, marginBottom: spacing[3] },
  acceptBtn: { paddingVertical: spacing[2], paddingHorizontal: spacing[4], borderRadius: roundness.md, alignSelf: 'flex-start' },
  acceptBtnText: { ...typography.label_lg },
  emptyText: { ...typography.body_md, textAlign: 'center', paddingVertical: spacing[4] },
  achievementRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[4] },
  achieveCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderRadius: roundness.lg,
  },
  achieveValue: { ...typography.title_sm, marginTop: spacing[1] },
  achieveLabel: { ...typography.label_sm, marginTop: spacing[1] },
  readinessRow: { marginBottom: spacing[3] },
  readinessLabel: { ...typography.label_lg, marginBottom: spacing[1] },
});
