import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import { VConicGauge, VGlassPanel } from '../../src/components';
import { useProfileStore } from '../../src/stores/profile';
import { useScoresStore } from '../../src/stores/scores';
import { useSquadStore } from '../../src/stores/squad';
import { calculateOML } from '../../src/engine/oml';
import type { OMLConfig, ACFTTables } from '../../src/engine/oml';
import omlConfig from '../../src/data/oml-config.json';
import acftTables from '../../src/data/acft-tables.json';

type Section = { type: 'header' | 'status' | 'oml' | 'gpa' | 'missions' | 'acft' };
const SECTIONS: Section[] = [
  { type: 'header' }, { type: 'status' }, { type: 'oml' },
  { type: 'gpa' }, { type: 'missions' }, { type: 'acft' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, glass } = useTheme();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const squad = useSquadStore();
  const ls = scores.scoreHistory[0];
  const la = scores.acftAssessments[0];
  const gpa = ls?.gpa;
  const acftTotal = ls?.acft_total;
  const hBg = isDark ? colors.surface_container_low : '#343c0a';
  const hTxt = isDark ? colors.on_surface : '#ffffff';

  const omlResult = useMemo(() => {
    if (!profile.yearGroup || !profile.gender || !profile.ageBracket) return null;
    try {
      return calculateOML({
        gpa: ls?.gpa ?? 0, mslGpa: ls?.msl_gpa ?? 0, acftScores: {},
        leadershipEval: ls?.leadership_eval ?? 0,
        cstScore: ls?.cst_score ?? undefined, clcScore: ls?.clc_score ?? undefined,
        commandRoles: [], extracurricularHours: 0,
        yearGroup: profile.yearGroup, gender: profile.gender, ageBracket: profile.ageBracket,
      }, omlConfig as OMLConfig, acftTables as unknown as ACFTTables);
    } catch { return null; }
  }, [profile, ls]);

  const oml = omlResult?.totalScore ?? ls?.total_oml ?? 0;

  const bentoData = [
    { abbrev: 'MDL', name: 'Deadlift', val: la?.deadlift },
    { abbrev: 'HRP', name: 'Push-ups', val: la?.push_ups },
    { abbrev: 'SDC', name: 'Sprint-Drag-Carry', val: la?.sprint_drag_carry },
    { abbrev: 'PLK', name: 'Plank', val: la?.plank },
    { abbrev: '2MR', name: '2-Mile Run', val: la?.two_mile_run },
  ];

  const BentoCell = ({ e, flex }: { e: typeof bentoData[0]; flex: number }) => (
    <View style={[s.bentoCard, { flex, backgroundColor: glass.overlayColor }]}>
      <Text style={[s.bentoAbbrev, { color: colors.primary }]}>{e.abbrev}</Text>
      <Text style={[s.bentoName, { color: colors.on_surface_variant }]}>{e.name}</Text>
      <Text style={[s.bentoVal, { color: colors.on_surface }]}>{e.val != null ? String(e.val) : '--'}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Section }) => {
    switch (item.type) {
      case 'header': return (
        <View style={[s.hdr, { backgroundColor: hBg }]}>
          <View>
            <Text style={[s.hdrTitle, { color: hTxt }]}>DUKE VANGUARD</Text>
            <Text style={[s.hdrSub, { color: isDark ? colors.outline : 'rgba(255,255,255,0.6)' }]}>Command Profile</Text>
          </View>
          <Pressable onPress={() => router.push('/settings' as any)} accessibilityLabel="Settings" hitSlop={12}>
            <MaterialIcons name="settings" size={22} color={hTxt} />
          </Pressable>
        </View>
      );
      case 'status': return (
        <VGlassPanel style={s.sec}>
          <Text style={[s.lbl, { color: colors.outline }]}>VANGUARD STATUS</Text>
          <Text style={[s.statusName, { color: colors.on_surface }]}>{profile.yearGroup ?? 'MSIII'} CADET</Text>
          <Text style={[s.statusRank, { color: colors.primary }]}>Battalion Rank #{squad.individualRank} / {squad.totalCadets}</Text>
          <Text style={[s.statusUnit, { color: colors.outline }]}>JMU ROTC</Text>
        </VGlassPanel>
      );
      case 'oml': return (
        <View style={s.sec}>
          <Text style={[s.secTitle, { color: colors.on_surface }]}>OML Command Center</Text>
          <View style={s.gaugeWrap}>
            <VConicGauge progress={Math.min(oml / 1000, 1)} size={256} strokeWidth={14}
              label={oml > 0 ? String(Math.round(oml)) : '--'} sublabel="/ 1000" />
          </View>
          <Text style={[s.traj, { color: colors.on_surface_variant }]}>
            {oml > 0 ? 'Performance trajectory: holding steady' : 'Enter scores to compute your OML'}
          </Text>
          <View style={s.chipRow}>
            {[{ v: oml > 0 ? `${Math.round((oml / 1000) * 100)}%` : '--', l: 'OML Percentile' },
              { v: acftTotal != null ? 'GREEN' : '--', l: 'Active Readiness' }].map((c, i) => (
              <View key={i} style={[s.chip, { backgroundColor: glass.overlayColor }]}>
                <Text style={[s.chipVal, { color: colors.on_surface }]}>{c.v}</Text>
                <Text style={[s.chipLbl, { color: colors.outline }]}>{c.l}</Text>
              </View>
            ))}
          </View>
          <Pressable style={[s.whatIf, { backgroundColor: colors.primary_container }]}
            onPress={() => router.push('/what-if' as any)} accessibilityLabel="What-If scenario planner">
            <MaterialIcons name="auto-fix-high" size={18} color={colors.on_primary_container} />
            <Text style={[s.whatIfTxt, { color: colors.on_primary_container }]}>What If?</Text>
          </Pressable>
        </View>
      );
      case 'gpa': return (
        <View style={[s.gpaCard, { backgroundColor: colors.primary_container }]}>
          <Text style={[s.gpaHl, { color: colors.on_primary_container }]}>Academic Superiority</Text>
          <Text style={[s.gpaVal, { color: colors.on_primary_container }]}>{gpa != null ? gpa.toFixed(2) : '--'}</Text>
          <Text style={[s.gpaLbl, { color: colors.on_primary_container }]}>Current GPA</Text>
        </View>
      );
      case 'missions': {
        const rows = [
          { icon: 'fitness-center' as const, label: 'AFT Score', value: acftTotal != null ? String(Math.round(acftTotal)) : '--' },
          { icon: 'military-tech' as const, label: 'Leadership Eval', value: ls?.leadership_eval != null ? String(ls.leadership_eval) : 'Pending' },
          { icon: 'assignment' as const, label: 'Cadet Eval', value: ls?.cst_score != null ? 'Complete' : 'Pending' },
        ];
        return (
          <View style={s.sec}>
            <Text style={[s.secTitle, { color: colors.on_surface }]}>Royal Missions Status</Text>
            {rows.map((m, i) => (
              <View key={i} style={[s.mRow, { borderBottomColor: colors.outline_variant, borderBottomWidth: i < 2 ? 0.5 : 0 }]}>
                <MaterialIcons name={m.icon} size={20} color={colors.primary} />
                <Text style={[s.mLabel, { color: colors.on_surface }]}>{m.label}</Text>
                <View style={[s.mBadge, { backgroundColor: m.value === 'Pending' ? colors.surface_container_highest : colors.primary_container }]}>
                  <Text style={[s.mBadgeTxt, { color: m.value === 'Pending' ? colors.outline : colors.on_primary_container }]}>{m.value}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      }
      case 'acft': return (
        <View style={s.sec}>
          <Text style={[s.secTitle, { color: colors.on_surface }]}>ACFT Readiness</Text>
          <View style={s.bentoRow}><BentoCell e={bentoData[0]} flex={2} /><BentoCell e={bentoData[1]} flex={1} /></View>
          <View style={s.bentoRow}><BentoCell e={bentoData[2]} flex={1} /><BentoCell e={bentoData[3]} flex={1} /></View>
          <View style={s.bentoRow}><BentoCell e={bentoData[4]} flex={1} /></View>
        </View>
      );
      default: return null;
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.surface }]}>
      <FlatList data={SECTIONS} renderItem={renderItem} keyExtractor={(i) => i.type}
        showsVerticalScrollIndicator={false} contentContainerStyle={s.list} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingBottom: spacing[16] },
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  hdrTitle: { ...typography.label_lg, letterSpacing: 2, textTransform: 'uppercase' },
  hdrSub: { ...typography.label_sm, marginTop: 2 },
  sec: { paddingHorizontal: spacing[4], marginBottom: spacing[4] },
  lbl: { ...typography.label_sm, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: spacing[1] },
  statusName: { ...typography.headline_md, marginBottom: spacing[1] },
  statusRank: { ...typography.title_sm, marginBottom: spacing[1] },
  statusUnit: { ...typography.label_md },
  secTitle: { ...typography.title_md, marginBottom: spacing[3] },
  gaugeWrap: { alignItems: 'center', marginBottom: spacing[3] },
  traj: { ...typography.body_sm, fontStyle: 'italic', textAlign: 'center', marginBottom: spacing[3] },
  chipRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[3] },
  chip: { flex: 1, alignItems: 'center', padding: spacing[3], borderRadius: roundness.lg },
  chipVal: { ...typography.title_md, marginBottom: 2 },
  chipLbl: { ...typography.label_sm },
  whatIf: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: spacing[1], paddingHorizontal: spacing[5], paddingVertical: spacing[2], borderRadius: roundness.md },
  whatIfTxt: { ...typography.label_lg },
  gpaCard: { marginHorizontal: spacing[4], marginBottom: spacing[4], padding: spacing[4], borderRadius: roundness.lg, alignItems: 'center' },
  gpaHl: { ...typography.title_sm, fontStyle: 'italic', marginBottom: spacing[2] },
  gpaVal: { ...typography.display_sm, marginBottom: spacing[1] },
  gpaLbl: { ...typography.label_md },
  mRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3], gap: spacing[2] },
  mLabel: { ...typography.body_md, flex: 1 },
  mBadge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: roundness.sm },
  mBadgeTxt: { ...typography.label_sm },
  bentoRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[2] },
  bentoCard: { padding: spacing[3], borderRadius: roundness.lg, justifyContent: 'center' },
  bentoAbbrev: { ...typography.headline_sm, marginBottom: 2 },
  bentoName: { ...typography.label_sm, marginBottom: spacing[1] },
  bentoVal: { ...typography.title_lg },
});
