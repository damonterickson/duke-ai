import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../src/theme/tokens';
import { VGlassPanel, VProgressBar, VAIResponse } from '../src/components';
import { useProfileStore } from '../src/stores/profile';
import { useScoresStore } from '../src/stores/scores';
import { useGoalsStore } from '../src/stores/goals';
import { generateBriefing, setLocalFallbackData } from '../src/services/ai';
import { buildContext } from '../src/engine/context';
import { calculateOML } from '../src/engine/oml';
import type { CadetProfile, OMLResult, OMLConfig, ACFTTables } from '../src/engine/oml';
import omlConfig from '../src/data/oml-config.json';
import acftTables from '../src/data/acft-tables.json';

interface BriefingSection {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

export default function IntelligenceBriefScreen() {
  const router = useRouter();
  const { colors, isDark, glass, ghostBorder } = useTheme();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const goalsStore = useGoalsStore();

  const headerBg = isDark ? colors.surface_container_high : '#343c0a';

  const [loading, setLoading] = useState(true);
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const latestScore = scores.scoreHistory[0];

  // Build OML result
  const omlResult = useMemo((): OMLResult | null => {
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
      return calculateOML(cadet, omlConfig as OMLConfig, acftTables as unknown as ACFTTables);
    } catch {
      return null;
    }
  }, [profile, latestScore]);

  const oml = omlResult?.totalScore ?? latestScore?.total_oml ?? 0;

  // Generate detailed briefing
  useEffect(() => {
    async function loadBriefing() {
      setLoading(true);
      if (!profile.yearGroup || !profile.gender || !profile.ageBracket) {
        setLoading(false);
        return;
      }
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
      const omlRes = omlResult ?? { totalScore: 0, pillarScores: { academic: 0, leadership: 0, physical: 0 }, marginalGains: {} };
      setLocalFallbackData(cadet, omlRes, goalsStore.getActiveGoals(), scores.scoreHistory);
      const ctx = buildContext(cadet, omlRes, [], undefined, goalsStore.getActiveGoals(), scores.scoreHistory);
      try {
        const text = await generateBriefing(ctx);
        setBriefingText(text);
      } catch (err) {
        console.error('Briefing generation error:', err);
      }
      setLoading(false);
    }
    loadBriefing();
  }, [profile, latestScore, omlResult, goalsStore, scores.scoreHistory]);

  // Build analysis sections from available data
  const sections = useMemo((): BriefingSection[] => {
    const result: BriefingSection[] = [];

    // Academic Analysis
    const gpa = latestScore?.gpa;
    if (gpa != null) {
      const impact = gpa >= 3.5 ? 'Your GPA is a strong contributor to your OML score.'
        : gpa >= 3.0 ? 'Your GPA is solid. Pushing above 3.5 would significantly boost your OML.'
        : 'Academic improvement should be a priority. Each 0.1 GPA increase has substantial OML impact.';
      result.push({
        title: 'Academic Assessment',
        icon: 'school',
        content: `Current GPA: ${gpa.toFixed(2)}. ${impact} MSL GPA: ${(latestScore?.msl_gpa ?? gpa).toFixed(2)}.`,
        priority: gpa < 3.0 ? 'high' : gpa < 3.5 ? 'medium' : 'low',
      });
    }

    // Physical Assessment
    const acft = latestScore?.acft_total;
    if (acft != null) {
      const impact = acft >= 500 ? 'Outstanding physical fitness. Maintain current training.'
        : acft >= 450 ? 'Above average ACFT. Target 500+ for maximum OML contribution.'
        : acft >= 360 ? 'Passing but room for growth. Focus on weakest events for best marginal gains.'
        : 'Physical fitness needs immediate attention. Consider structured training program.';
      result.push({
        title: 'Physical Readiness',
        icon: 'fitness-center',
        content: `ACFT Total: ${Math.round(acft)}/600. ${impact}`,
        priority: acft < 360 ? 'high' : acft < 450 ? 'medium' : 'low',
      });
    }

    // Leadership Assessment
    const leadership = latestScore?.leadership_eval;
    if (leadership != null) {
      result.push({
        title: 'Leadership Evaluation',
        icon: 'military-tech',
        content: `Commander Assessment: ${leadership}/100. ${leadership >= 80 ? 'Strong leadership marks. Continue seeking command opportunities.' : 'Focus on visibility in leadership roles and volunteering for challenging positions.'}`,
        priority: leadership < 70 ? 'high' : leadership < 80 ? 'medium' : 'low',
      });
    }

    // Branch Probability
    if (profile.targetBranch) {
      result.push({
        title: 'Branch Analysis',
        icon: 'my-location',
        content: `Target: ${profile.targetBranch}. ${oml >= 700 ? 'Your OML is competitive for most branches.' : oml >= 500 ? 'Competitive for many branches. Continue improvement for highest-demand branches.' : 'Focus on raising OML to improve branch probability. Every pillar improvement helps.'}`,
        priority: oml < 500 ? 'high' : 'medium',
      });
    }

    // Goals Progress
    const activeGoals = goalsStore.getActiveGoals();
    if (activeGoals.length > 0) {
      const completed = activeGoals.filter(g => g.status === 'completed').length;
      result.push({
        title: 'Goal Progress',
        icon: 'flag',
        content: `${activeGoals.length} active goals. ${completed} completed. ${activeGoals.length - completed} in progress. Stay focused on daily objectives for consistent improvement.`,
        priority: completed === 0 ? 'medium' : 'low',
      });
    }

    return result;
  }, [latestScore, profile, oml, goalsStore]);

  const handleShare = useCallback(async () => {
    const text = `Intelligence Brief - Duke Vanguard\n\nOML Score: ${Math.round(oml)}/1000\n\n${sections.map(s => `${s.title}: ${s.content}`).join('\n\n')}`;
    try {
      await Share.share({ message: text });
    } catch {}
  }, [oml, sections]);

  const priorityColor = (p: string) => {
    switch (p) {
      case 'high': return colors.error;
      case 'medium': return colors.tertiary;
      default: return '#4caf50';
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: headerBg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerText}>INTELLIGENCE BRIEF</Text>
        <Pressable onPress={handleShare} hitSlop={12} accessibilityLabel="Share brief">
          <MaterialIcons name="share" size={24} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Classification Banner */}
        <View style={[styles.classificationBanner, { backgroundColor: colors.primary_container }]}>
          <MaterialIcons name="verified-user" size={16} color={colors.on_primary_container} />
          <Text style={[styles.classificationText, { color: colors.on_primary_container }]}>
            VANGUARD INTELLIGENCE BRIEF — {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
          </Text>
        </View>

        {/* OML Summary */}
        <VGlassPanel style={styles.omlSummary}>
          <Text style={[styles.omlLabel, { color: colors.outline }]}>COMPOSITE OML SCORE</Text>
          <View style={styles.omlRow}>
            <Text style={[styles.omlValue, { color: colors.on_surface }]}>
              {oml > 0 ? Math.round(oml) : '--'}
            </Text>
            <Text style={[styles.omlMax, { color: colors.outline }]}> / 1000</Text>
          </View>
          <VProgressBar progress={Math.min(oml / 1000, 1)} />
          {profile.goalOml != null && (
            <Text style={[styles.goalText, { color: colors.primary }]}>
              Target: {profile.goalOml} ({oml > 0 ? `${Math.round(profile.goalOml - oml)} points to go` : 'Set scores to track'})
            </Text>
          )}

          {/* Pillar breakdown */}
          <View style={styles.pillarRow}>
            {[
              { label: 'Academic', value: latestScore?.gpa ? Math.min(latestScore.gpa / 4.0, 1) : 0, display: latestScore?.gpa?.toFixed(2) ?? '--' },
              { label: 'Physical', value: latestScore?.acft_total ? Math.min(latestScore.acft_total / 600, 1) : 0, display: latestScore?.acft_total ? `${Math.round(latestScore.acft_total)}` : '--' },
              { label: 'Leadership', value: latestScore?.leadership_eval ? Math.min(latestScore.leadership_eval / 100, 1) : 0, display: latestScore?.leadership_eval?.toString() ?? '--' },
            ].map((pillar, i) => (
              <View key={i} style={styles.pillarItem}>
                <Text style={[styles.pillarLabel, { color: colors.outline }]}>{pillar.label}</Text>
                <Text style={[styles.pillarValue, { color: colors.on_surface }]}>{pillar.display}</Text>
                <VProgressBar progress={pillar.value} />
              </View>
            ))}
          </View>
        </VGlassPanel>

        {/* AI Analysis */}
        {loading ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.outline }]}>
              Generating intelligence brief...
            </Text>
          </View>
        ) : briefingText ? (
          <VGlassPanel style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <MaterialIcons name="auto-awesome" size={20} color={colors.primary} />
              <Text style={[styles.aiTitle, { color: colors.primary }]}>
                AI STRATEGIC ANALYSIS
              </Text>
            </View>
            <VAIResponse text={briefingText} />
          </VGlassPanel>
        ) : null}

        {/* Detailed Sections */}
        {sections.length > 0 && (
          <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>Detailed Assessment</Text>
        )}
        {sections.map((section) => {
          const isExpanded = expandedSection === section.title;
          return (
            <Pressable
              key={section.title}
              style={[
                styles.assessmentCard,
                {
                  backgroundColor: glass.overlayColor,
                  borderColor: ghostBorder.color,
                  borderWidth: ghostBorder.width,
                },
              ]}
              onPress={() => setExpandedSection(isExpanded ? null : section.title)}
              accessibilityLabel={`${section.title} - ${section.priority} priority`}
            >
              <View style={styles.assessmentHeader}>
                <View style={styles.assessmentTitleRow}>
                  <MaterialIcons name={section.icon as any} size={22} color={colors.primary} />
                  <Text style={[styles.assessmentTitle, { color: colors.on_surface }]}>
                    {section.title}
                  </Text>
                </View>
                <View style={styles.assessmentRight}>
                  <View style={[styles.priorityDot, { backgroundColor: priorityColor(section.priority) }]} />
                  <Text style={[styles.priorityText, { color: priorityColor(section.priority) }]}>
                    {section.priority.toUpperCase()}
                  </Text>
                  <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={20}
                    color={colors.outline}
                  />
                </View>
              </View>
              {isExpanded && (
                <Text style={[styles.assessmentContent, { color: colors.on_surface }]}>
                  {section.content}
                </Text>
              )}
            </Pressable>
          );
        })}

        {/* No Data State */}
        {sections.length === 0 && !loading && (
          <VGlassPanel style={styles.noDataCard}>
            <MaterialIcons name="info-outline" size={32} color={colors.outline} />
            <Text style={[styles.noDataTitle, { color: colors.on_surface }]}>
              Insufficient Data
            </Text>
            <Text style={[styles.noDataDesc, { color: colors.outline }]}>
              Complete your profile and enter scores to receive a full intelligence brief with actionable recommendations.
            </Text>
          </VGlassPanel>
        )}

        {/* Action Items */}
        {sections.filter(s => s.priority === 'high').length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>Priority Actions</Text>
            {sections.filter(s => s.priority === 'high').map((s, i) => (
              <View key={i} style={[styles.actionItem, { borderLeftColor: colors.error }]}>
                <Text style={[styles.actionText, { color: colors.on_surface }]}>
                  {s.title}: {s.content.split('.')[1]?.trim() ?? s.content}
                </Text>
              </View>
            ))}
          </>
        )}
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

  // Classification
  classificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    borderRadius: roundness.md,
    marginBottom: spacing[4],
  },
  classificationText: {
    ...typography.label_sm,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // OML Summary
  omlSummary: { marginBottom: spacing[4] },
  omlLabel: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing[1],
  },
  omlRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing[2] },
  omlValue: { ...typography.display_sm },
  omlMax: { ...typography.title_md },
  goalText: { ...typography.label_md, marginTop: spacing[2] },
  pillarRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[4],
  },
  pillarItem: { flex: 1 },
  pillarLabel: { ...typography.label_sm, marginBottom: spacing[1] },
  pillarValue: { ...typography.title_sm, marginBottom: spacing[1] },

  // Loading
  loadingSection: { alignItems: 'center', paddingVertical: spacing[8] },
  loadingText: { ...typography.body_md, marginTop: spacing[3] },

  // AI Section
  aiSection: { marginBottom: spacing[4] },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  aiTitle: {
    ...typography.label_lg,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Sections
  sectionTitle: {
    ...typography.title_md,
    marginBottom: spacing[3],
    marginTop: spacing[2],
  },

  // Assessment cards
  assessmentCard: {
    padding: spacing[4],
    borderRadius: roundness.xl,
    marginBottom: spacing[2],
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assessmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  assessmentTitle: { ...typography.title_sm },
  assessmentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityText: { ...typography.label_sm },
  assessmentContent: {
    ...typography.body_md,
    marginTop: spacing[3],
    lineHeight: 22,
  },

  // No data
  noDataCard: { alignItems: 'center', gap: spacing[2] },
  noDataTitle: { ...typography.title_md },
  noDataDesc: { ...typography.body_md, textAlign: 'center' },

  // Action items
  actionItem: {
    borderLeftWidth: 3,
    paddingLeft: spacing[3],
    paddingVertical: spacing[2],
    marginBottom: spacing[2],
  },
  actionText: { ...typography.body_md },
});
