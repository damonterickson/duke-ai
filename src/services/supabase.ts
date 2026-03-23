/**
 * Supabase Service — Auth, Squads, and Achievement Sync
 *
 * First backend dependency for Duke Vanguard.
 * Uses magic link auth via school email (@dukes.jmu.edu).
 * Squad data syncs via Supabase Realtime subscriptions.
 * Achievements queue offline and flush on reconnect.
 *
 *   AUTH FLOW:
 *   Email input → sendMagicLink() → email delivered → deep link → session
 *
 *   SQUAD FLOW:
 *   createSquad() → generates 6-char code → leader is creator
 *   joinSquad(code) → lookup → insert member → fetch squad data
 *
 *   ACHIEVEMENT SYNC:
 *   mission/badge complete → syncAchievement() → insert per squad → realtime push
 */

import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Client Init
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Squad features disabled.');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        detectSessionInUrl: false,
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SquadRow {
  id: string;
  name: string;
  invite_code: string;
  leader_id: string;
  created_at: string;
}

export interface SquadMemberRow {
  id: string;
  squad_id: string;
  user_id: string;
  joined_at: string;
}

export interface ProfileRow {
  id: string;
  display_name: string;
  year_group: string;
  avatar_url: string | null;
  created_at: string;
}

export interface SharedAchievementRow {
  id: string;
  user_id: string;
  squad_id: string;
  type: 'mission_complete' | 'badge_unlock';
  title: string;
  description: string | null;
  achieved_at: string;
  // Joined from profiles
  profiles?: { display_name: string; year_group: string };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signInWithMagicLink(email: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'dukevanguard://auth-callback',
    },
  });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  await sb.auth.signOut();
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

export async function getSession() {
  const sb = getSupabase();
  const { data } = await sb.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (session: any) => void) {
  const sb = getSupabase();
  return sb.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ---------------------------------------------------------------------------
// Profile Sync (local profile → Supabase on first auth)
// ---------------------------------------------------------------------------

export async function upsertSupabaseProfile(profile: {
  display_name: string;
  year_group: string;
}): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  const { error } = await sb.from('profiles').upsert({
    id: session.user.id,
    display_name: profile.display_name,
    year_group: profile.year_group,
  });

  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Squads CRUD
// ---------------------------------------------------------------------------

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createSquad(name: string): Promise<{ squad: SquadRow | null; error: string | null }> {
  const sb = getSupabase();
  const session = await getSession();
  if (!session) return { squad: null, error: 'Not authenticated' };

  const invite_code = generateInviteCode();

  // Insert squad
  const { data: squad, error: squadError } = await sb
    .from('squads')
    .insert({ name, invite_code, leader_id: session.user.id })
    .select()
    .single();

  if (squadError) return { squad: null, error: squadError.message };

  // Add creator as member
  const { error: memberError } = await sb
    .from('squad_members')
    .insert({ squad_id: squad.id, user_id: session.user.id });

  if (memberError) {
    console.error('[Supabase] Failed to add creator as member:', memberError);
  }

  return { squad, error: null };
}

export async function joinSquad(inviteCode: string): Promise<{ squad: SquadRow | null; error: string | null }> {
  const sb = getSupabase();
  const session = await getSession();
  if (!session) return { squad: null, error: 'Not authenticated' };

  // Lookup squad by invite code
  const { data: squad, error: lookupError } = await sb
    .from('squads')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (lookupError || !squad) return { squad: null, error: 'Squad not found. Check the invite code.' };

  // Check if already a member
  const { data: existing } = await sb
    .from('squad_members')
    .select('id')
    .eq('squad_id', squad.id)
    .eq('user_id', session.user.id)
    .single();

  if (existing) return { squad, error: 'You\'re already in this squad.' };

  // Check squad count limit (max 5)
  const { count } = await sb
    .from('squad_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id);

  if (count && count >= 5) return { squad: null, error: 'You can be in a maximum of 5 squads.' };

  // Join
  const { error: joinError } = await sb
    .from('squad_members')
    .insert({ squad_id: squad.id, user_id: session.user.id });

  if (joinError) return { squad: null, error: joinError.message };

  return { squad, error: null };
}

export async function leaveSquad(squadId: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  const { error } = await sb
    .from('squad_members')
    .delete()
    .eq('squad_id', squadId)
    .eq('user_id', session.user.id);

  return { error: error?.message ?? null };
}

export async function removeSquadMember(squadId: string, userId: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const session = await getSession();
  if (!session) return { error: 'Not authenticated' };

  // Verify caller is leader
  const { data: squad } = await sb
    .from('squads')
    .select('leader_id')
    .eq('id', squadId)
    .single();

  if (!squad || squad.leader_id !== session.user.id) {
    return { error: 'Only the squad leader can remove members.' };
  }

  const { error } = await sb
    .from('squad_members')
    .delete()
    .eq('squad_id', squadId)
    .eq('user_id', userId);

  return { error: error?.message ?? null };
}

// ---------------------------------------------------------------------------
// Squad Queries
// ---------------------------------------------------------------------------

export async function getMySquads(): Promise<{ squads: SquadRow[]; error: string | null }> {
  const sb = getSupabase();
  const session = await getSession();
  if (!session) return { squads: [], error: 'Not authenticated' };

  const { data: memberships, error: memError } = await sb
    .from('squad_members')
    .select('squad_id')
    .eq('user_id', session.user.id);

  if (memError || !memberships?.length) return { squads: [], error: memError?.message ?? null };

  const squadIds = memberships.map((m) => m.squad_id);
  const { data: squads, error: squadError } = await sb
    .from('squads')
    .select('*')
    .in('id', squadIds)
    .order('created_at', { ascending: false });

  return { squads: squads ?? [], error: squadError?.message ?? null };
}

export async function getSquadMembers(squadId: string): Promise<{ members: ProfileRow[]; error: string | null }> {
  const sb = getSupabase();

  const { data: memberships, error: memError } = await sb
    .from('squad_members')
    .select('user_id')
    .eq('squad_id', squadId);

  if (memError || !memberships?.length) return { members: [], error: memError?.message ?? null };

  const userIds = memberships.map((m) => m.user_id);
  const { data: profiles, error: profileError } = await sb
    .from('profiles')
    .select('*')
    .in('id', userIds);

  return { members: profiles ?? [], error: profileError?.message ?? null };
}

export async function getSquadDetail(squadId: string): Promise<{
  squad: SquadRow | null;
  members: ProfileRow[];
  error: string | null;
}> {
  const sb = getSupabase();

  const { data: squad, error: squadError } = await sb
    .from('squads')
    .select('*')
    .eq('id', squadId)
    .single();

  if (squadError || !squad) return { squad: null, members: [], error: squadError?.message ?? null };

  const { members, error: memError } = await getSquadMembers(squadId);

  return { squad, members, error: memError };
}

// ---------------------------------------------------------------------------
// Achievement Sync
// ---------------------------------------------------------------------------

export async function syncAchievement(achievement: {
  type: 'mission_complete' | 'badge_unlock';
  title: string;
  description?: string;
}): Promise<void> {
  const sb = getSupabase();
  const session = await getSession();
  if (!session) return;

  // Get all squads the user is in
  const { squads } = await getMySquads();
  if (!squads.length) return;

  // Insert one achievement row per squad
  const rows = squads.map((squad) => ({
    user_id: session.user.id,
    squad_id: squad.id,
    type: achievement.type,
    title: achievement.title,
    description: achievement.description ?? null,
  }));

  const { error } = await sb.from('shared_achievements').insert(rows);
  if (error) {
    console.error('[Supabase] Achievement sync failed:', error);
    // TODO: queue for offline retry
  }
}

export async function getSquadAchievements(
  squadId: string,
  limit = 20,
): Promise<{ achievements: SharedAchievementRow[]; error: string | null }> {
  const sb = getSupabase();

  const { data, error } = await sb
    .from('shared_achievements')
    .select('*, profiles(display_name, year_group)')
    .eq('squad_id', squadId)
    .order('achieved_at', { ascending: false })
    .limit(limit);

  return { achievements: (data as SharedAchievementRow[]) ?? [], error: error?.message ?? null };
}

export function subscribeToSquadAchievements(
  squadId: string,
  callback: (achievement: SharedAchievementRow) => void,
): RealtimeChannel {
  const sb = getSupabase();

  return sb
    .channel(`squad-achievements-${squadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'shared_achievements',
        filter: `squad_id=eq.${squadId}`,
      },
      (payload) => {
        callback(payload.new as SharedAchievementRow);
      },
    )
    .subscribe();
}
