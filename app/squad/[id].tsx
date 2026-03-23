import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { typography, spacing, roundness } from '../../src/theme/tokens';
import {
  getSquadDetail,
  getSquadAchievements,
  subscribeToSquadAchievements,
  leaveSquad,
  removeSquadMember,
  getSession,
  type SquadRow,
  type ProfileRow,
  type SharedAchievementRow,
} from '../../src/services/supabase';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function SquadDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const [squad, setSquad] = useState<SquadRow | null>(null);
  const [members, setMembers] = useState<ProfileRow[]>([]);
  const [achievements, setAchievements] = useState<SharedAchievementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isLeader = squad?.leader_id === currentUserId;

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const session = await getSession();
    setCurrentUserId(session?.user?.id ?? null);
    const [detail, achResult] = await Promise.all([
      getSquadDetail(id),
      getSquadAchievements(id),
    ]);
    if (detail.squad) setSquad(detail.squad);
    setMembers(detail.members);
    setAchievements(achResult.achievements);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    if (!id) return;
    const channel = subscribeToSquadAchievements(id, (newAch) => {
      setAchievements((prev) => [newAch, ...prev]);
    });
    return () => { channel.unsubscribe(); };
  }, [id]);

  const handleRemoveMember = (userId: string, name: string) => {
    Alert.alert('Remove Member', `Remove ${name} from this squad?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          const { error } = await removeSquadMember(id!, userId);
          if (error) Alert.alert('Error', error);
          else setMembers((prev) => prev.filter((m) => m.id !== userId));
        },
      },
    ]);
  };

  const handleLeave = () => {
    Alert.alert('Leave Squad', 'Are you sure you want to leave this squad?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive', onPress: async () => {
          const { error } = await leaveSquad(id!);
          if (error) Alert.alert('Error', error);
          else router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
        <ActivityIndicator style={{ marginTop: spacing[8] }} color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]}>
      <View style={[styles.header, { borderBottomColor: colors.surface_container }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={colors.on_surface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.on_surface }]} numberOfLines={1}>
          {squad?.name ?? 'Squad'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Squad Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface_container }]}>
          <Text style={[styles.squadName, { color: colors.on_surface }]}>{squad?.name}</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.outline }]}>Members</Text>
            <Text style={[styles.infoValue, { color: colors.on_surface }]}>{members.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.outline }]}>Created</Text>
            <Text style={[styles.infoValue, { color: colors.on_surface }]}>
              {squad ? new Date(squad.created_at).toLocaleDateString() : '--'}
            </Text>
          </View>
          {isLeader && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.outline }]}>Invite Code</Text>
              <Text style={[styles.codeValue, { color: colors.primary }]}>{squad?.invite_code}</Text>
            </View>
          )}
        </View>

        {/* Members */}
        <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>Members</Text>
        {members.map((member) => (
          <View key={member.id} style={[styles.memberCard, { backgroundColor: colors.surface_container }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.on_primary }]}>
                {member.display_name?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.on_surface }]}>{member.display_name}</Text>
              <Text style={[styles.memberYear, { color: colors.outline }]}>YG {member.year_group}</Text>
            </View>
            {member.id === squad?.leader_id && (
              <MaterialIcons name="star" size={18} color={colors.primary} />
            )}
            {isLeader && member.id !== squad?.leader_id && (
              <TouchableOpacity onPress={() => handleRemoveMember(member.id, member.display_name)}>
                <MaterialIcons name="person-remove" size={20} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Achievement Feed */}
        <Text style={[styles.sectionTitle, { color: colors.on_surface }]}>Achievement Feed</Text>
        {achievements.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.outline }]}>
            No achievements yet. Complete missions to share with your squad!
          </Text>
        ) : (
          achievements.map((ach) => (
            <View key={ach.id} style={[styles.achCard, { backgroundColor: colors.surface_container }]}>
              <View style={styles.achIconWrap}>
                <MaterialIcons
                  name={ach.type === 'mission_complete' ? 'emoji-events' : 'star'}
                  size={24}
                  color={ach.type === 'mission_complete' ? '#FFB300' : colors.primary}
                />
              </View>
              <View style={styles.achContent}>
                <View style={styles.achHeader}>
                  <Text style={[styles.achProfile, { color: colors.on_surface }]}>
                    {ach.profiles?.display_name ?? 'Unknown'}
                  </Text>
                  <Text style={[styles.achTime, { color: colors.outline }]}>
                    {timeAgo(ach.achieved_at)}
                  </Text>
                </View>
                {ach.profiles?.year_group && (
                  <Text style={[styles.achYearGroup, { color: colors.outline }]}>
                    YG {ach.profiles.year_group}
                  </Text>
                )}
                <Text style={[styles.achTitle, { color: colors.on_surface }]}>{ach.title}</Text>
                {ach.description && (
                  <Text style={[styles.achDesc, { color: colors.outline }]}>{ach.description}</Text>
                )}
              </View>
            </View>
          ))
        )}

        {/* Leave Squad */}
        <TouchableOpacity
          style={[styles.leaveBtn, { borderColor: colors.error }]}
          onPress={handleLeave}
        >
          <MaterialIcons name="logout" size={18} color={colors.error} />
          <Text style={[styles.leaveBtnText, { color: colors.error }]}>Leave Squad</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1,
  },
  headerTitle: { ...typography.title_md, flex: 1, textAlign: 'center' },
  content: { padding: spacing[4], paddingBottom: spacing[16] },
  infoCard: {
    borderRadius: roundness.lg, padding: spacing[4], marginBottom: spacing[4],
  },
  squadName: { ...typography.title_lg, marginBottom: spacing[3] },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing[1],
  },
  infoLabel: { ...typography.label_md },
  infoValue: { ...typography.body_md },
  codeValue: { ...typography.title_sm, letterSpacing: 3 },
  sectionTitle: { ...typography.title_md, marginBottom: spacing[3], marginTop: spacing[2] },
  memberCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: roundness.md,
    padding: spacing[3], marginBottom: spacing[2],
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...typography.label_lg },
  memberInfo: { flex: 1, marginLeft: spacing[3] },
  memberName: { ...typography.label_lg },
  memberYear: { ...typography.label_sm },
  emptyText: { ...typography.body_md, textAlign: 'center', paddingVertical: spacing[4] },
  achCard: {
    flexDirection: 'row', borderRadius: roundness.md, padding: spacing[3], marginBottom: spacing[2],
  },
  achIconWrap: { marginRight: spacing[3], paddingTop: 2 },
  achContent: { flex: 1 },
  achHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  achProfile: { ...typography.label_lg },
  achTime: { ...typography.label_sm },
  achYearGroup: { ...typography.label_sm, marginBottom: spacing[1] },
  achTitle: { ...typography.body_md, marginTop: spacing[1] },
  achDesc: { ...typography.body_sm, marginTop: spacing[1] },
  leaveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderRadius: roundness.md, paddingVertical: spacing[3],
    marginTop: spacing[6], gap: spacing[2],
  },
  leaveBtnText: { ...typography.label_lg },
});
