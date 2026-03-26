/**
 * Supabase Service — Auth, Squads, and Achievement Sync
 *
 * Web migration: uses @supabase/ssr createBrowserClient instead of
 * createClient with AsyncStorage.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Client Init
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Squad features disabled.');
      // Return a dummy client that won't crash — all operations will fail gracefully
      supabase = createBrowserClient(
        'https://placeholder.supabase.co',
        'placeholder-key'
      );
    } else {
      supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
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
  profiles?: { display_name: string; year_group: string };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signInWithMagicLink(email: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const redirectTo = `${baseUrl}/auth/callback`;
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });
  return { error: error?.message ?? null };
}

export async function signInWithOAuth(provider: 'google' | 'github' | 'apple'): Promise<{ error: string | null }> {
  const sb = getSupabase();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const { error } = await sb.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
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
// Profile Sync
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
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createSquad(name: string): Promise<{ squad: SquadRow | null; error: string | null }> {
  const sb = getSupabase();
  const session = await getSession();
  if (!session) return { squad: null, error: 'Not authenticated. Please sign in first.' };

  const userId = session.user.id;

  // Ensure a profiles row exists for this user (required by foreign keys)
  const { data: existingProfile } = await sb
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!existingProfile) {
    await sb.from('profiles').upsert({
      id: userId,
      name: session.user.user_metadata?.full_name ?? session.user.email ?? 'Cadet',
      year_group: 'MSIII',
      onboarding_complete: true,
    });
  }

  const invite_code = generateInviteCode();

  const { data: squad, error: squadError } = await sb
    .from('squads')
    .insert({ name, invite_code, leader_id: userId })
    .select()
    .single();

  if (squadError) return { squad: null, error: squadError.message };

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

  const { data: squad, error: lookupError } = await sb
    .from('squads')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (lookupError || !squad) return { squad: null, error: 'Squad not found. Check the invite code.' };

  const { data: existing } = await sb
    .from('squad_members')
    .select('id')
    .eq('squad_id', squad.id)
    .eq('user_id', session.user.id)
    .single();

  if (existing) return { squad, error: "You're already in this squad." };

  const { count } = await sb
    .from('squad_members')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id);

  if (count && count >= 5) return { squad: null, error: 'You can be in a maximum of 5 squads.' };

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

  const { squads } = await getMySquads();
  if (!squads.length) return;

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
