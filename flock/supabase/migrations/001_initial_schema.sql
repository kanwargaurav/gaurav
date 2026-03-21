-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  vibe_profile jsonb not null default '{"personas":[],"vibes":[],"budget":"mid","dietary":[],"accessibility":[]}',
  home_city text,
  total_trips int default 0,
  total_clones int default 0,
  follower_count int default 0,
  following_count int default 0,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TRIPS
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  destination text not null,
  country_code text,
  cover_emoji text default '🌍',
  cover_image text,
  itinerary jsonb not null default '[]',
  days int not null default 7,
  budget_usd int,
  actual_cost int,
  currency text default 'USD',
  tags text[] default '{}',
  personas text[] default '{}',
  is_public boolean default true,
  is_draft boolean default false,
  clone_count int default 0,
  like_count int default 0,
  view_count int default 0,
  ai_summary text,
  ai_tips text[],
  best_season text,
  parent_trip_id uuid references public.trips(id),
  status text default 'planning',
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GROUP TRIPS
create table if not exists public.group_trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trip_id uuid references public.trips(id) on delete set null,
  created_by uuid references public.profiles(id),
  invite_code text unique default substr(md5(random()::text), 1, 8),
  members jsonb not null default '[]',
  vote_options jsonb default '[]',
  vote_results jsonb default '{}',
  ai_suggestion jsonb default '{}',
  status text default 'planning',
  max_members int default 20,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- MEMORIES
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null default 'note',
  content text,
  caption text,
  location_name text,
  latitude double precision,
  longitude double precision,
  ai_caption text,
  is_highlight boolean default false,
  is_public boolean default true,
  taken_at timestamptz default now(),
  created_at timestamptz default now()
);

-- TRIP LIKES
create table if not exists public.trip_likes (
  trip_id uuid references public.trips(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (trip_id, user_id)
);

-- FOLLOWS
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- CHAT SESSIONS
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  messages jsonb not null default '[]',
  persona text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb default '{}',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- WAITLIST
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  persona text,
  source text default 'web',
  created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.group_trips enable row level security;
alter table public.memories enable row level security;
alter table public.trip_likes enable row level security;
alter table public.follows enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.notifications enable row level security;
alter table public.waitlist enable row level security;

-- Policies
create policy "public profiles" on public.profiles for select using (true);
create policy "owner update profiles" on public.profiles for update using (auth.uid() = id);
create policy "owner insert profiles" on public.profiles for insert with check (auth.uid() = id);

create policy "public trips" on public.trips for select using (is_public = true and is_draft = false);
create policy "owner trips" on public.trips for all using (auth.uid() = user_id);

create policy "owner memories" on public.memories for all using (auth.uid() = user_id);
create policy "public memories" on public.memories for select using (is_public = true);

create policy "owner chat" on public.chat_sessions for all using (auth.uid() = user_id);
create policy "owner notifs" on public.notifications for all using (auth.uid() = user_id);

create policy "group members select" on public.group_trips for select
  using (created_by = auth.uid() or members @> jsonb_build_array(jsonb_build_object('user_id', auth.uid()::text)));
create policy "group creator" on public.group_trips for all using (created_by = auth.uid());

create policy "anyone insert waitlist" on public.waitlist for insert with check (true);

-- Indexes
create index if not exists idx_trips_user on public.trips(user_id);
create index if not exists idx_trips_public on public.trips(is_public, clone_count desc);
create index if not exists idx_trips_tags on public.trips using gin(tags);
create index if not exists idx_memories_trip on public.memories(trip_id);
create index if not exists idx_notifs_user on public.notifications(user_id, is_read);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_trips_updated before update on public.trips for each row execute function update_updated_at();
create trigger trg_profiles_updated before update on public.profiles for each row execute function update_updated_at();
