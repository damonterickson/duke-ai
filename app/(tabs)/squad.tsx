import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import { VGlassPanel, VProgressBar } from '../../src/components';
import { useSquadStore } from '../../src/stores/squad';
import { useEngagementStore } from '../../src/stores/engagement';

export default function SquadScreen() {
  const router = useRouter();
  const { colors, isDark, glass, ghostBorder } = useTheme();
  const squad = useSquadStore();
  const engagement = useEngagementStore();

  const headerBg = isDark ? colors.surface_container_low : '#343c0a';
  const headerText = isDark ? colors.on_surface : '#ffffff';
  const headerSub = isDark ? colors.outline : 'rgba(255,255,255,0.6)';

  // Sparkline: normalise weeklyRankHistory (lower rank = better, invert for bar height)
  const history = squad.weeklyRankHistory;
  const maxRank = Math.max(...history, 1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: headerBg }]}>
        <View>
          <Text style={[styles.headerTitle, { color: headerText }]}>
            DUKE VANGUARD
          </Text>
          <Text style={[styles.headerSub, { color: headerSub }]}>
            Squad Operations
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings' as any)}
          accessibilityLabel="Settings"
          hitSlop={12}
        >
          <MaterialIcons name="settings" size={22} color={headerText} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Squad Hero */}
        <Text
          style={[styles.heroTitle, { color: colors.on_surface }]}
          accessibilityRole="header"
        >
          Squad: {squad.squadName}
        </Text>
        <Text style={[styles.heroStanding, { color: colors.primary }]}>
          #{squad.squadRank} Ranked of {squad.totalSquads} Companies
        </Text>
        <VProgressBar
          progress={1 - (squad.squadRank - 1) / Math.max(squad.totalSquads - 1, 1)}
          height={10}
          style={styles.heroProgress}
          accessibilityLabel={`Squad rank ${squad.squadRank} of ${squad.totalSquads}`}
        />

        {/* Competition Card */}
        <VGlassPanel style={styles.competitionCard}>
          <View style={styles.competitionHeader}>
            <Text style={[styles.competitionTitle, { color: colors.on_surface }]}>
              JMU AFT Challenge
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.primary_container },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.on_primary_container }]}>
                Active Op
              </Text>
            </View>
          </View>
          <Text style={[styles.competitionSub, { color: colors.outline }]}>
            Ends in 4 days
          </Text>
          <Text style={[styles.competitionDesc, { color: colors.on_surface_variant }]}>
            Annual fitness test challenge between JMU ROTC companies. Push your
            squad to the top of the leaderboard.
          </Text>
          <Pressable
            style={[
              styles.detailsBtn,
              { backgroundColor: colors.primary_container },
            ]}
            accessibilityLabel="Engagement details"
          >
            <Text
              style={[styles.detailsBtnText, { color: colors.on_primary_container }]}
            >
              Engagement Details
            </Text>
          </Pressable>
        </VGlassPanel>

        {/* Individual Rank Card */}
        <VGlassPanel style={styles.rankCard}>
          <Text style={[styles.sectionLabel, { color: colors.outline }]}>
            YOUR STANDING
          </Text>
          <Text style={[styles.rankValue, { color: colors.on_surface }]}>
            Rank {squad.individualRank} / {squad.totalCadets}
          </Text>

          {/* Sparkline */}
          <View style={styles.sparkline} accessibilityLabel="Weekly rank trend">
            {history.map((rank, i) => {
              const barHeight = ((maxRank - rank + 1) / maxRank) * 48;
              return (
                <View
                  key={i}
                  style={[
                    styles.sparkBar,
                    {
                      height: Math.max(barHeight, 4),
                      backgroundColor:
                        i === history.length - 1
                          ? colors.primary
                          : colors.outline_variant,
                    },
                  ]}
                />
              );
            })}
          </View>
          <Text style={[styles.sparkLabel, { color: colors.outline }]}>
            Weekly rank history
          </Text>
        </VGlassPanel>

        {/* Badges Grid */}
        <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>
          Badges
        </Text>
        <View style={styles.badgesGrid}>
          {engagement.badges.slice(0, 3).map((b) => {
            const unlocked = !!b.unlockedAt;
            return (
              <View
                key={b.id}
                style={[
                  styles.badgeCard,
                  {
                    backgroundColor: glass.overlayColor,
                    borderColor: ghostBorder.color,
                    borderWidth: ghostBorder.width,
                    opacity: unlocked ? 1 : 0.5,
                  },
                ]}
                accessibilityLabel={`${b.name} badge${unlocked ? ', earned' : ', locked'}`}
              >
                <MaterialIcons
                  name={b.icon as any}
                  size={28}
                  color={unlocked ? colors.primary : colors.outline}
                />
                <Text
                  style={[styles.badgeName, { color: colors.on_surface }]}
                  numberOfLines={1}
                >
                  {b.name}
                </Text>
                <Text
                  style={[styles.badgeDesc, { color: colors.outline }]}
                  numberOfLines={2}
                >
                  {b.description}
                </Text>
                {unlocked && (
                  <Text style={[styles.badgeEarned, { color: colors.primary }]}>
                    Earned!
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* View Squad Stats Card */}
        <VGlassPanel style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <MaterialIcons
              name="analytics"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.statsTitle, { color: colors.on_surface }]}>
              View Squad Stats
            </Text>
          </View>
          <Text style={[styles.statsDesc, { color: colors.on_surface_variant }]}>
            Compare companies across ACFT, GPA, and leadership metrics.
          </Text>
          <View style={styles.avatarRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.avatar,
                  { backgroundColor: colors.surface_container_highest },
                  i > 0 && { marginLeft: -8 },
                ]}
              />
            ))}
          </View>
        </VGlassPanel>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  headerTitle: {
    ...typography.label_lg,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerSub: {
    ...typography.label_sm,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[16],
  },

  // Hero
  heroTitle: {
    ...typography.headline_md,
    marginBottom: spacing[1],
  },
  heroStanding: {
    ...typography.title_sm,
    marginBottom: spacing[2],
  },
  heroProgress: { marginBottom: spacing[5] },

  // Competition
  competitionCard: { marginBottom: spacing[4] },
  competitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  competitionTitle: { ...typography.title_lg },
  badge: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: roundness.sm,
  },
  badgeText: {
    ...typography.label_sm,
    textTransform: 'uppercase',
  },
  competitionSub: {
    ...typography.label_md,
    marginBottom: spacing[2],
  },
  competitionDesc: {
    ...typography.body_md,
    marginBottom: spacing[3],
  },
  detailsBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: roundness.md,
  },
  detailsBtnText: {
    ...typography.label_lg,
  },

  // Individual Rank
  rankCard: { marginBottom: spacing[4] },
  sectionLabel: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing[1],
  },
  rankValue: { ...typography.headline_sm, marginBottom: spacing[3] },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 52,
    marginBottom: spacing[1],
  },
  sparkBar: {
    width: 8,
    borderRadius: roundness.sm,
  },
  sparkLabel: { ...typography.label_sm },

  // Badges
  sectionTitle: {
    ...typography.title_md,
    marginBottom: spacing[3],
  },
  badgesGrid: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  badgeCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: roundness.lg,
  },
  badgeName: {
    ...typography.label_md,
    marginTop: spacing[1],
    textAlign: 'center',
  },
  badgeDesc: {
    ...typography.body_sm,
    textAlign: 'center',
    marginTop: 2,
  },
  badgeEarned: {
    ...typography.label_sm,
    marginTop: spacing[1],
  },

  // Stats Card
  statsCard: { marginBottom: spacing[4] },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  statsTitle: { ...typography.title_lg },
  statsDesc: {
    ...typography.body_md,
    marginBottom: spacing[3],
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
