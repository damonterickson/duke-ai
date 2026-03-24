-- Duke Vanguard: Initial Schema
-- All tables use auth.uid() for Row Level Security

-- ============================================================
-- Cadet Profile
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  year_group text check (year_group in ('MSI', 'MSII', 'MSIII', 'MSIV')),
  gender text check (gender in ('male', 'female')),
  age_bracket text check (age_bracket in ('17-21', '22-26', '27-31')),
  target_branch text,
  goal_oml integer,
  photo_uri text,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- ============================================================
-- Score History (GPA, leadership evals, etc.)
-- ============================================================
create table if not exists public.score_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  gpa numeric(3,2),
  msl_gpa numeric(3,2),
  acft_total integer,
  commander_assessment integer,
  cst_score integer,
  clc_score integer,
  recorded_at timestamptz default now()
);

alter table public.score_history enable row level security;
create policy "Users can view own scores" on public.score_history for select using (auth.uid() = user_id);
create policy "Users can insert own scores" on public.score_history for insert with check (auth.uid() = user_id);
create policy "Users can update own scores" on public.score_history for update using (auth.uid() = user_id);

create index idx_score_history_user on public.score_history(user_id, recorded_at desc);

-- ============================================================
-- ACFT Assessments (individual event scores)
-- ============================================================
create table if not exists public.acft_assessments (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  deadlift integer,
  power_throw numeric(4,1),
  push_ups integer,
  sprint_drag_carry integer,
  plank integer,
  two_mile_run integer,
  alt_event_name text,
  alt_event_score integer,
  total integer,
  notes text,
  recorded_at timestamptz default now()
);

alter table public.acft_assessments enable row level security;
create policy "Users can view own acft" on public.acft_assessments for select using (auth.uid() = user_id);
create policy "Users can insert own acft" on public.acft_assessments for insert with check (auth.uid() = user_id);

create index idx_acft_user on public.acft_assessments(user_id, recorded_at desc);

-- ============================================================
-- Goals
-- ============================================================
create table if not exists public.goals (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in ('academic', 'physical', 'leadership', 'overall')),
  status text not null default 'active' check (status in ('active', 'completed', 'retired')),
  target_value numeric,
  current_value numeric default 0,
  target_metric text,
  deadline timestamptz,
  oml_impact numeric,
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.goals enable row level security;
create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);

create index idx_goals_user_active on public.goals(user_id) where status = 'active';

-- ============================================================
-- Goal Progress Log
-- ============================================================
create table if not exists public.goal_progress (
  id bigint generated always as identity primary key,
  goal_id bigint not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  old_value numeric,
  new_value numeric,
  source text,
  recorded_at timestamptz default now()
);

alter table public.goal_progress enable row level security;
create policy "Users can view own progress" on public.goal_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.goal_progress for insert with check (auth.uid() = user_id);

-- ============================================================
-- Conversations (AI chat history)
-- ============================================================
create table if not exists public.conversations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;
create policy "Users can view own conversations" on public.conversations for select using (auth.uid() = user_id);
create policy "Users can insert own conversations" on public.conversations for insert with check (auth.uid() = user_id);
create policy "Users can delete own conversations" on public.conversations for delete using (auth.uid() = user_id);

create index idx_conversations_user on public.conversations(user_id, created_at desc);

-- ============================================================
-- Courses (Canvas integration)
-- ============================================================
create table if not exists public.courses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  code text,
  grade text,
  credits numeric(3,1) default 3.0,
  is_msl boolean default false,
  semester text,
  source text default 'manual',
  created_at timestamptz default now()
);

alter table public.courses enable row level security;
create policy "Users can manage own courses" on public.courses for all using (auth.uid() = user_id);

-- ============================================================
-- Leadership Entries
-- ============================================================
create table if not exists public.leadership_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_type text not null check (entry_type in ('command_role', 'extracurricular', 'community_service', 'award')),
  title text not null,
  description text,
  hours integer,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

alter table public.leadership_entries enable row level security;
create policy "Users can manage own leadership" on public.leadership_entries for all using (auth.uid() = user_id);

-- ============================================================
-- App Settings (per-user key-value store)
-- ============================================================
create table if not exists public.user_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text,
  primary key (user_id, key)
);

alter table public.user_settings enable row level security;
create policy "Users can manage own settings" on public.user_settings for all using (auth.uid() = user_id);

-- ============================================================
-- Updated-at trigger function
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
