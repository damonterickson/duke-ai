import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
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

// ---------------------------------------------------------------------------
// Inline editable field component
// ---------------------------------------------------------------------------

interface EditableFieldProps {
  value: string;
  placeholder: string;
  onSave: (value: string) => void;
  textStyle: object;
  validate?: (value: string) => boolean;
  keyboardType?: 'default' | 'numeric';
  maxLength?: number;
  colors: ReturnType<typeof useTheme>['colors'];
}

function EditableField({
  value,
  placeholder,
  onSave,
  textStyle,
  validate,
  keyboardType = 'default',
  maxLength,
  colors,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<TextInput>(null);

  const startEditing = useCallback(() => {
    setDraft(value);
    setEditing(true);
    // Auto-focus after state update renders the TextInput
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [value]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && (!validate || validate(trimmed))) {
      onSave(trimmed);
    }
    setEditing(false);
  }, [draft, onSave, validate]);

  if (editing) {
    return (
      <TextInput
        ref={inputRef}
        value={draft}
        onChangeText={setDraft}
        onBlur={commit}
        onSubmitEditing={commit}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        returnKeyType="done"
        style={[
          textStyle,
          {
            color: colors.on_surface,
            backgroundColor: colors.surface_container,
            borderRadius: roundness.md,
            paddingHorizontal: spacing[2],
            paddingVertical: spacing[1],
            minWidth: 80,
          },
        ]}
        autoFocus
      />
    );
  }

  return (
    <Pressable onPress={startEditing} hitSlop={8}>
      <View style={s.editableRow}>
        <Text style={[textStyle, { color: colors.on_surface }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <MaterialIcons
          name="edit"
          size={13}
          color={colors.outline}
          style={s.editIcon}
        />
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Section types
// ---------------------------------------------------------------------------

type Section = { type: 'personal' | 'oml' | 'scorecards' | 'status' };
const SECTIONS: Section[] = [
  { type: 'personal' },
  { type: 'oml' },
  { type: 'scorecards' },
  { type: 'status' },
];

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, glass } = useTheme();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const squad = useSquadStore();

  const ls = scores.scoreHistory[0];
  const gpa = ls?.gpa;
  const acftTotal = ls?.acft_total;

  // Compute OML
  const omlResult = useMemo(() => {
    if (!profile.yearGroup || !profile.gender || !profile.ageBracket) return null;
    try {
      return calculateOML(
        {
          gpa: ls?.gpa ?? 0,
          mslGpa: ls?.msl_gpa ?? 0,
          acftScores: {},
          leadershipEval: ls?.leadership_eval ?? 0,
          cstScore: ls?.cst_score ?? undefined,
          clcScore: ls?.clc_score ?? undefined,
          commandRoles: [],
          extracurricularHours: 0,
          yearGroup: profile.yearGroup,
          gender: profile.gender,
          ageBracket: profile.ageBracket,
        },
        omlConfig as OMLConfig,
        acftTables as unknown as ACFTTables,
      );
    } catch {
      return null;
    }
  }, [profile, ls]);

  const oml = omlResult?.totalScore ?? ls?.total_oml ?? 0;

  // Derive initials from name
  const initials = useMemo(() => {
    const name = profile.name?.trim();
    if (!name) return '??';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [profile.name]);

  // Leadership combined score
  const leadershipScore = useMemo(() => {
    const le = ls?.leadership_eval;
    const cst = ls?.cst_score;
    if (le != null && cst != null) return le + cst;
    if (le != null) return le;
    if (cst != null) return cst;
    return null;
  }, [ls]);

  // Streak (mock: use weeklyRankHistory length as streak for now)
  const streak = squad.weeklyRankHistory.length;

  // ---------------------------------------------------------------------------
  // Render sections
  // ---------------------------------------------------------------------------

  const renderItem = ({ item }: { item: Section }) => {
    switch (item.type) {
      // ─── Personal Info ───────────────────────────────────────────────
      case 'personal':
        return (
          <View style={s.personalSection}>
            {/* Header row: settings gear */}
            <View style={s.personalHeader}>
              <Text
                style={[
                  s.headerLabel,
                  { color: colors.outline },
                ]}
              >
                COMMAND PROFILE
              </Text>
              <Pressable
                onPress={() => router.push('/settings' as any)}
                accessibilityLabel="Settings"
                hitSlop={12}
              >
                <MaterialIcons name="settings" size={22} color={colors.on_surface} />
              </Pressable>
            </View>

            {/* Avatar + info */}
            <View style={s.personalContent}>
              {/* Photo placeholder */}
              <Pressable
                onPress={() => Alert.alert('Photo', 'Coming soon')}
                accessibilityLabel="Change profile photo"
                style={[
                  s.avatar,
                  { backgroundColor: colors.primary_container },
                ]}
              >
                <Text style={[s.avatarText, { color: colors.on_primary_container }]}>
                  {initials}
                </Text>
              </Pressable>

              {/* Editable fields */}
              <View style={s.personalFields}>
                <EditableField
                  value={profile.name ?? ''}
                  placeholder="Cadet Name"
                  onSave={(v) => profile.updateProfile({ name: v })}
                  textStyle={typography.title_lg}
                  colors={colors}
                />

                <Text style={[s.yearGroupText, { color: colors.outline }]}>
                  {profile.yearGroup ?? 'MSI'} Cadet
                </Text>

                <View style={s.fieldRow}>
                  <Text style={[s.fieldLabel, { color: colors.outline }]}>Branch</Text>
                  <EditableField
                    value={profile.targetBranch ?? ''}
                    placeholder="Target Branch"
                    onSave={(v) => profile.updateProfile({ targetBranch: v })}
                    textStyle={typography.body_md}
                    colors={colors}
                  />
                </View>

                <View style={s.fieldRow}>
                  <Text style={[s.fieldLabel, { color: colors.outline }]}>Goal OML</Text>
                  <EditableField
                    value={profile.goalOml != null ? String(profile.goalOml) : ''}
                    placeholder="0-1000"
                    onSave={(v) => {
                      const n = parseInt(v, 10);
                      if (!isNaN(n) && n >= 0 && n <= 1000) {
                        profile.updateProfile({ goalOml: n });
                      }
                    }}
                    validate={(v) => {
                      const n = parseInt(v, 10);
                      return !isNaN(n) && n >= 0 && n <= 1000;
                    }}
                    textStyle={typography.body_md}
                    keyboardType="numeric"
                    maxLength={4}
                    colors={colors}
                  />
                </View>
              </View>
            </View>
          </View>
        );

      // ─── OML Gauge ──────────────────────────────────────────────────
      case 'oml':
        return (
          <View style={s.sec}>
            <Text style={[s.secTitle, { color: colors.on_surface }]}>
              OML Command Center
            </Text>
            <View style={s.gaugeWrap}>
              <VConicGauge
                progress={Math.min(oml / 1000, 1)}
                size={256}
                strokeWidth={14}
                label={oml > 0 ? String(Math.round(oml)) : '--'}
                sublabel="/ 1000"
              />
            </View>
            <Text style={[s.traj, { color: colors.on_surface_variant }]}>
              {oml > 0
                ? 'Performance trajectory: holding steady'
                : 'Enter scores to compute your OML'}
            </Text>
            <View style={s.chipRow}>
              {[
                {
                  v: oml > 0 ? `${Math.round((oml / 1000) * 100)}%` : '--',
                  l: 'OML Percentile',
                },
                {
                  v: acftTotal != null ? 'GREEN' : '--',
                  l: 'Active Readiness',
                },
              ].map((c, i) => (
                <View
                  key={i}
                  style={[s.chip, { backgroundColor: glass.overlayColor }]}
                >
                  <Text style={[s.chipVal, { color: colors.on_surface }]}>{c.v}</Text>
                  <Text style={[s.chipLbl, { color: colors.outline }]}>{c.l}</Text>
                </View>
              ))}
            </View>
            <Pressable
              style={[s.whatIf, { backgroundColor: colors.primary_container }]}
              onPress={() => router.push('/what-if' as any)}
              accessibilityLabel="What-If scenario planner"
            >
              <MaterialIcons
                name="auto-fix-high"
                size={18}
                color={colors.on_primary_container}
              />
              <Text style={[s.whatIfTxt, { color: colors.on_primary_container }]}>
                What If?
              </Text>
            </Pressable>
          </View>
        );

      // ─── Score Cards ────────────────────────────────────────────────
      case 'scorecards': {
        const cards = [
          {
            icon: 'fitness-center' as const,
            label: 'ACFT',
            value: acftTotal != null ? String(Math.round(acftTotal)) : '--',
            sublabel: 'Total Score',
            route: '/(tabs)/fitness' as const,
          },
          {
            icon: 'school' as const,
            label: 'GPA',
            value: gpa != null ? gpa.toFixed(2) : '--',
            sublabel: 'Cumulative',
            route: '/(tabs)/academics' as const,
          },
          {
            icon: 'military-tech' as const,
            label: 'Leadership',
            value: leadershipScore != null ? String(leadershipScore) : '--',
            sublabel:
              ls?.leadership_eval != null && ls?.cst_score != null
                ? `Eval ${ls.leadership_eval} + CST ${ls.cst_score}`
                : 'Eval + CST',
            route: '/(tabs)/leadership' as const,
          },
        ];

        return (
          <View style={s.sec}>
            <Text style={[s.secTitle, { color: colors.on_surface }]}>
              Performance Overview
            </Text>
            {cards.map((card, i) => (
              <Pressable
                key={i}
                style={[
                  s.scoreCard,
                  { backgroundColor: colors.surface_container_low },
                ]}
                onPress={() => router.navigate(card.route as any)}
                accessibilityLabel={`View ${card.label} details`}
                accessibilityRole="button"
              >
                <View
                  style={[
                    s.scoreCardIcon,
                    { backgroundColor: colors.primary_container },
                  ]}
                >
                  <MaterialIcons
                    name={card.icon}
                    size={20}
                    color={colors.on_primary_container}
                  />
                </View>
                <View style={s.scoreCardBody}>
                  <Text
                    style={[s.scoreCardLabel, { color: colors.on_surface_variant }]}
                  >
                    {card.label}
                  </Text>
                  <Text style={[s.scoreCardValue, { color: colors.on_surface }]}>
                    {card.value}
                  </Text>
                  <Text
                    style={[s.scoreCardSublabel, { color: colors.outline }]}
                    numberOfLines={1}
                  >
                    {card.sublabel}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={colors.outline}
                />
              </Pressable>
            ))}
          </View>
        );
      }

      // ─── Status Section ─────────────────────────────────────────────
      case 'status':
        return (
          <VGlassPanel style={s.statusSection}>
            <Text style={[s.statusLabel, { color: colors.outline }]}>
              VANGUARD STATUS
            </Text>
            <View style={s.statusRow}>
              <View style={s.statusItem}>
                <MaterialIcons name="leaderboard" size={20} color={colors.primary} />
                <Text style={[s.statusItemLabel, { color: colors.outline }]}>
                  Battalion Rank
                </Text>
                <Text style={[s.statusItemValue, { color: colors.on_surface }]}>
                  #{squad.individualRank}
                  <Text style={[s.statusItemSub, { color: colors.outline }]}>
                    {' '}/ {squad.totalCadets}
                  </Text>
                </Text>
              </View>
              <View
                style={[
                  s.statusDivider,
                  { backgroundColor: colors.surface_container_high },
                ]}
              />
              <View style={s.statusItem}>
                <MaterialIcons name="local-fire-department" size={20} color={colors.primary} />
                <Text style={[s.statusItemLabel, { color: colors.outline }]}>
                  Streak
                </Text>
                <Text style={[s.statusItemValue, { color: colors.on_surface }]}>
                  {streak}
                  <Text style={[s.statusItemSub, { color: colors.outline }]}>
                    {' '}weeks
                  </Text>
                </Text>
              </View>
            </View>
          </VGlassPanel>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.surface }]}>
      <FlatList
        data={SECTIONS}
        renderItem={renderItem}
        keyExtractor={(i) => i.type}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingBottom: spacing[16] },

  // Personal info section
  personalSection: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
  },
  personalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  headerLabel: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  personalContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[4],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: roundness.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.headline_sm,
  },
  personalFields: {
    flex: 1,
    gap: spacing[1],
  },
  yearGroupText: {
    ...typography.label_md,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  fieldLabel: {
    ...typography.label_sm,
    minWidth: 64,
  },

  // Editable field helpers
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editIcon: {
    marginTop: 1,
  },

  // OML section (carried from original)
  sec: { paddingHorizontal: spacing[4], marginBottom: spacing[4] },
  secTitle: { ...typography.title_md, marginBottom: spacing[3] },
  gaugeWrap: { alignItems: 'center', marginBottom: spacing[3] },
  traj: {
    ...typography.body_sm,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  chipRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[3] },
  chip: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: roundness.lg,
  },
  chipVal: { ...typography.title_md, marginBottom: 2 },
  chipLbl: { ...typography.label_sm },
  whatIf: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    borderRadius: roundness.md,
  },
  whatIfTxt: { ...typography.label_lg },

  // Score cards
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: roundness.lg,
    marginBottom: spacing[2],
    gap: spacing[3],
  },
  scoreCardIcon: {
    width: 40,
    height: 40,
    borderRadius: roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCardBody: {
    flex: 1,
  },
  scoreCardLabel: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreCardValue: {
    ...typography.headline_sm,
    marginTop: 2,
  },
  scoreCardSublabel: {
    ...typography.label_sm,
    marginTop: 2,
  },

  // Status section
  statusSection: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    padding: spacing[4],
  },
  statusLabel: {
    ...typography.label_sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing[3],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
  },
  statusItemLabel: {
    ...typography.label_sm,
  },
  statusItemValue: {
    ...typography.title_lg,
  },
  statusItemSub: {
    ...typography.label_sm,
  },
  statusDivider: {
    width: 1,
    height: 40,
    marginHorizontal: spacing[3],
  },
});
