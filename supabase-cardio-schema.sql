-- Cardio sessions log
create table if not exists cardio_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  session_type text not null, -- rehiit | hiit | threshold | zone2
  equipment text,
  duration_minutes numeric,
  avg_hr integer,
  peak_hr integer,
  rpe numeric,
  intervals_completed integer,
  sprint1_rpe numeric,
  sprint2_rpe numeric,
  notes text,
  logged_at timestamptz default now()
);

-- Lab test / fitness profile
create table if not exists fitness_profile (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  test_date date not null,
  vo2max numeric,
  anaerobic_threshold_vo2 numeric,
  aerobic_threshold_vo2 numeric,
  peak_hr integer,
  hr_recovery_1min integer,
  hr_recovery_2min integer,
  aerobic_threshold_hr integer,
  anaerobic_threshold_hr integer,
  notes text,
  created_at timestamptz default now()
);

-- Manual VO2max entries (monthly tracking)
create table if not exists vo2max_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  value numeric not null,
  source text default 'manual', -- manual | garmin | lab
  recorded_at timestamptz default now()
);

-- Enable RLS
alter table cardio_sessions enable row level security;
alter table fitness_profile enable row level security;
alter table vo2max_entries enable row level security;

-- Policies
create policy "Users manage own cardio" on cardio_sessions for all using (auth.uid() = user_id);
create policy "Users manage own fitness profile" on fitness_profile for all using (auth.uid() = user_id);
create policy "Users manage own vo2max" on vo2max_entries for all using (auth.uid() = user_id);
