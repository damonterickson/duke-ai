-- Duke Vanguard: Squad Challenges / Ops
-- Leaders create challenges, members mark them complete

-- ============================================================
-- Squad Challenges
-- ============================================================
create table if not exists public.squad_challenges (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references public.squads(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  points integer default 0,
  deadline timestamptz,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

alter table public.squad_challenges enable row level security;

-- All authenticated users can view challenges (simple — no self-referencing subquery)
create policy "Authenticated users can view challenges" on public.squad_challenges
  for select using (auth.uid() is not null);

-- Only squad leaders can create challenges
create policy "Leaders can create challenges" on public.squad_challenges
  for insert with check (
    squad_id in (select id from public.squads where leader_id = auth.uid())
  );

-- Only squad leaders can update challenges (mark complete, cancel)
create policy "Leaders can update challenges" on public.squad_challenges
  for update using (
    squad_id in (select id from public.squads where leader_id = auth.uid())
  );

-- Only squad leaders can delete challenges
create policy "Leaders can delete challenges" on public.squad_challenges
  for delete using (
    squad_id in (select id from public.squads where leader_id = auth.uid())
  );

-- ============================================================
-- Challenge Completions
-- ============================================================
create table if not exists public.challenge_completions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.squad_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_at timestamptz default now(),
  unique(challenge_id, user_id)
);

alter table public.challenge_completions enable row level security;

-- All authenticated users can view completions
create policy "Authenticated users can view completions" on public.challenge_completions
  for select using (auth.uid() is not null);

-- Users can mark themselves as having completed a challenge
create policy "Users can complete challenges" on public.challenge_completions
  for insert with check (auth.uid() = user_id);

-- Users can un-complete their own completions
create policy "Users can remove own completions" on public.challenge_completions
  for delete using (auth.uid() = user_id);
