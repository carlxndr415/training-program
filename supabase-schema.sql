-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  is_admin boolean default false,
  program_id text default 'carl_ppl_6day',
  created_at timestamptz default now()
);

-- Lift history table (one row per set logged)
create table if not exists lift_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  exercise_id text not null,
  exercise_name text not null,
  set_num integer not null,
  weight numeric,
  reps integer,
  rpe numeric,
  logged_at timestamptz default now()
);

-- Training blocks table
create table if not exists training_blocks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  program_id text not null,
  start_date timestamptz default now(),
  block_length_weeks integer default 4,
  unique(user_id, program_id)
);

-- Custom workouts table (per-user edits)
create table if not exists custom_workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  workout_key text not null,
  workout_data jsonb not null,
  updated_at timestamptz default now(),
  unique(user_id, workout_key)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table lift_history enable row level security;
alter table training_blocks enable row level security;
alter table custom_workouts enable row level security;

-- RLS Policies — users can only read/write their own data
create policy "Users can manage own profile" on profiles for all using (auth.uid() = id);
create policy "Users can manage own lifts" on lift_history for all using (auth.uid() = user_id);
create policy "Users can manage own blocks" on training_blocks for all using (auth.uid() = user_id);
create policy "Users can manage own workouts" on custom_workouts for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    (select count(*) = 0 from profiles)
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
