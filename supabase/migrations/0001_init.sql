-- Schema + RLS for the cashgame app.
-- Run this once in the Supabase SQL Editor for a new project.

create table public.players (
  id bigint generated always as identity primary key,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.games (
  id bigint generated always as identity primary key,
  date timestamptz not null default now(),
  buy_in_value numeric not null,
  re_buy_value numeric not null,
  chip_value numeric not null,
  status text not null default 'LOBBY',
  created_at timestamptz not null default now()
);

create table public.game_players (
  id bigint generated always as identity primary key,
  game_id bigint not null references public.games(id) on delete cascade,
  person_id bigint not null references public.players(id),
  quantity_rebuy int not null default 0,
  chips numeric not null default 0,
  created_at timestamptz not null default now()
);

-- role assignment lives here; rows are managed by the admin directly in the
-- Table Editor (or via Auth > Invite user, then insert the matching row) —
-- there is no client-side write path into this table.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'operator')),
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.players enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.profiles enable row level security;

-- Anyone (including the anon key, no login) can read game data.
create policy "players are publicly readable" on public.players
  for select using (true);

create policy "games are publicly readable" on public.games
  for select using (true);

create policy "game_players are publicly readable" on public.game_players
  for select using (true);

-- Only admin/operator accounts can write. One helper condition, repeated per
-- table/command since Postgres RLS policies can't span commands.
create policy "operators can insert players" on public.players
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can update players" on public.players
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can insert games" on public.games
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can update games" on public.games
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can insert game_players" on public.game_players
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can update game_players" on public.game_players
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

-- Callers can only read their own profile row (used by the app to resolve
-- the signed-in user's role).
create policy "users can read own profile" on public.profiles
  for select using (auth.uid() = id);
