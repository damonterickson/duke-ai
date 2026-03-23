import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import {
  getSession,
  getMySquads,
  getSquadMembers,
  onAuthStateChange,
  type SquadRow,
} from '../../src/services/supabase';

interface SquadWithCount extends SquadRow {
  memberCount: number;
}

export default function SquadScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [session, setSession] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [squads, setSquads] = useState<SquadWithCount[]>([]);
  const [loading, setLoading] = useState(false);

  const headerBg = isDark ? colors.surface_container_low : '#343c0a';
  const headerText = isDark ? colors.on_surface : '#ffffff';
  const headerSub = isDark ? colors.outline : 'rgba(255,255,255,0.6)';

  // Check auth on mount + listen for changes
  useEffect(() => {
    getSession().then((s) => { setSession(s); setAuthChecked(true); });
    const { data } = onAuthStateChange((s) => { setSession(s); setAuthChecked(true); });
    return () => { data.subscription.unsubscribe(); };
  }, []);

  // Fetch squads when authenticated
  const fetchSquads = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { squads: rows } = await getMySquads();
    // Fetch member counts in parallel
    const withCounts: SquadWithCount[] = await Promise.all(
      rows.map(async (sq) => {
        const { members } = await getSquadMembers(sq.id);
        return { ...sq, memberCount: members.length };
      }),
    );
    setSquads(withCounts);
    setLoading(false);
  }, [session]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      if (session) fetchSquads();
    }, [session, fetchSquads]),
  );

  // ------- Render helpers -------

  const renderUnauthenticated = () => (
    <View style={styles.emptyCenter}>
      <MaterialIcons name="shield" size={56} color={colors.outline} />
      <Text style={[styles.emptyTitle, { color: colors.on_surface }]}>
        Sign in to unlock Squads
      </Text>
      <Text style={[styles.emptyDesc, { color: colors.outline }]}>
        Create squads, invite your battle buddies, and share achievements.
      </Text>
      <Pressable
        style={[styles.primaryBtn, { backgroundColor: headerBg }]}
        onPress={() => router.push('/auth' as any)}
      >
        <Text style={styles.primaryBtnText}>Sign In</Text>
      </Pressable>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyCenter}>
      <MaterialIcons name="groups" size={56} color={colors.outline} />
      <Text style={[styles.emptyTitle, { color: colors.on_surface }]}>No squads yet</Text>
      <View style={styles.btnRow}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: headerBg }]}
          onPress={() => router.push('/squad/create' as any)}
        >
          <Text style={styles.primaryBtnText}>Create Squad</Text>
        </Pressable>
        <Pressable
          style={[styles.outlineBtn, { borderColor: colors.outline }]}
          onPress={() => router.push('/squad/join' as any)}
        >
          <Text style={[styles.outlineBtnText, { color: colors.on_surface }]}>Join Squad</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderSquads = () => (
    <>
      {squads.map((sq) => {
        const isLeader = session?.user?.id === sq.leader_id;
        return (
          <Pressable
            key={sq.id}
            style={[styles.squadCard, { backgroundColor: colors.surface_container, borderColor: colors.outline_variant }]}
            onPress={() => router.push(`/squad/${sq.id}` as any)}
            accessibilityLabel={`Squad ${sq.name}`}
          >
            <View style={styles.squadCardHeader}>
              <Text style={[styles.squadName, { color: colors.on_surface }]} numberOfLines={1}>
                {sq.name}
              </Text>
              {isLeader && (
                <View style={[styles.leaderBadge, { backgroundColor: colors.primary_container }]}>
                  <Text style={[styles.leaderBadgeText, { color: colors.on_primary_container }]}>
                    Leader
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.squadMeta}>
              <MaterialIcons name="people" size={16} color={colors.outline} />
              <Text style={[styles.metaText, { color: colors.outline }]}>
                {sq.memberCount} {sq.memberCount === 1 ? 'member' : 'members'}
              </Text>
            </View>
            <Text style={[styles.inviteCode, { color: colors.outline_variant }]}>
              Code: {sq.invite_code}
            </Text>
          </Pressable>
        );
      })}
      <View style={styles.btnRow}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: headerBg }]}
          onPress={() => router.push('/squad/create' as any)}
        >
          <Text style={styles.primaryBtnText}>Create Squad</Text>
        </Pressable>
        <Pressable
          style={[styles.outlineBtn, { borderColor: colors.outline }]}
          onPress={() => router.push('/squad/join' as any)}
        >
          <Text style={[styles.outlineBtnText, { color: colors.on_surface }]}>Join Squad</Text>
        </Pressable>
      </View>
    </>
  );

  const renderBody = () => {
    if (!authChecked) return <ActivityIndicator style={styles.loader} color={colors.primary} />;
    if (!session) return renderUnauthenticated();
    if (loading && squads.length === 0) return <ActivityIndicator style={styles.loader} color={colors.primary} />;
    if (squads.length === 0) return renderEmpty();
    return renderSquads();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { backgroundColor: headerBg }]}>
        <View>
          <Text style={[styles.headerTitle, { color: headerText }]}>DUKE VANGUARD</Text>
          <Text style={[styles.headerSub, { color: headerSub }]}>Squad Operations</Text>
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
        {renderBody()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  headerTitle: { ...typography.label_lg, letterSpacing: 2, textTransform: 'uppercase' },
  headerSub: { ...typography.label_sm, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: spacing[4], paddingBottom: spacing[16] },
  loader: { marginTop: spacing[10] },
  emptyCenter: { alignItems: 'center', paddingTop: spacing[10] },
  emptyTitle: { ...typography.headline_sm, marginTop: spacing[4], marginBottom: spacing[2], textAlign: 'center' },
  emptyDesc: { ...typography.body_md, textAlign: 'center', marginBottom: spacing[5], paddingHorizontal: spacing[4] },
  btnRow: { flexDirection: 'row', gap: spacing[3], marginTop: spacing[4] },
  primaryBtn: { flex: 1, paddingVertical: spacing[3], borderRadius: roundness.md, alignItems: 'center' },
  primaryBtnText: { ...typography.label_lg, color: '#ffffff' },
  outlineBtn: { flex: 1, paddingVertical: spacing[3], borderRadius: roundness.md, alignItems: 'center', borderWidth: 1 },
  outlineBtnText: { ...typography.label_lg },
  squadCard: { borderRadius: roundness.lg, padding: spacing[4], marginBottom: spacing[3], borderWidth: 1 },
  squadCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[1] },
  squadName: { ...typography.title_md, flex: 1 },
  leaderBadge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: roundness.sm, marginLeft: spacing[2] },
  leaderBadgeText: { ...typography.label_sm, textTransform: 'uppercase' },
  squadMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginBottom: spacing[1] },
  metaText: { ...typography.label_sm },
  inviteCode: { ...typography.label_sm },
});
