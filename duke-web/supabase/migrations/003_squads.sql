-- Duke Vanguard: Squads & Squad Members tables
-- Required for Squad Operations feature

-- ============================================================
-- Squads
-- ============================================================
create table if not exists public.squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  leader_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.squads enable row level security;

-- Anyone authenticated can view squads (needed for join by invite code)
create policy "Authenticated users can view squads" on public.squads
  for select using (auth.uid() is not null);

-- Only authenticated users can create squads
create policy "Authenticated users can create squads" on public.squads
  for insert with check (auth.uid() = leader_id);

-- Only the leader can update their squad
create policy "Leaders can update own squads" on public.squads
  for update using (auth.uid() = leader_id);

-- Only the leader can delete their squad
create policy "Leaders can delete own squads" on public.squads
  for delete using (auth.uid() = leader_id);

-- ============================================================
-- Squad Members (junction table)
-- ============================================================
create table if not exists public.squad_members (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(squad_id, user_id)
);

alter table public.squad_members enable row level security;

-- Members can view their own squad memberships
create policy "Users can view own memberships" on public.squad_members
  for select using (auth.uid() = user_id);

-- Members of a squad can view other members
create policy "Squad members can view squad members" on public.squad_members
  for select using (
    squad_id in (select squad_id from public.squad_members where user_id = auth.uid())
  );

-- Authenticated users can join squads
create policy "Authenticated users can join squads" on public.squad_members
  for insert with check (auth.uid() = user_id);

-- Users can leave squads (delete own membership)
create policy "Users can leave squads" on public.squad_members
  for delete using (auth.uid() = user_id);

-- Squad leaders can remove members
create policy "Leaders can remove members" on public.squad_members
  for delete using (
    squad_id in (select id from public.squads where leader_id = auth.uid())
  );

-- ============================================================
-- Shared Achievements
-- ============================================================
create table if not exists public.shared_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  squad_id uuid not null references public.squads(id) on delete cascade,
  type text not null check (type in ('mission_complete', 'badge_unlock')),
  title text not null,
  description text,
  achieved_at timestamptz default now()
);

alter table public.shared_achievements enable row level security;

-- Squad members can view achievements in their squads
create policy "Squad members can view achievements" on public.shared_achievements
  for select using (
    squad_id in (select squad_id from public.squad_members where user_id = auth.uid())
  );

-- Users can insert their own achievements
create policy "Users can share achievements" on public.shared_achievements
  for insert with check (auth.uid() = user_id);

-- Enable realtime for achievements
alter publication supabase_realtime add table public.shared_achievements;
