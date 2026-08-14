-- Rake collection (per-player-per-game fee), a club expenses ledger, and
-- one-off donations.

-- Snapshotted per game at creation time, same as buy_in_value/re_buy_value,
-- so changing the rake amount going forward never rewrites past games.
-- Nullable and with no default: games created before rake collection started
-- (see 0010_backfill_rake_start.sql) simply have no rake_value and are
-- excluded from rake tracking entirely, rather than being backfilled to a
-- value that was never actually collected. Every game created through the
-- app from here on always sets this explicitly.
alter table public.games add column rake_value numeric;

-- One game_players row already exists per (game, player), so rake-paid status
-- lives there rather than in a new join table. It already cascades on game
-- delete (game_id ... on delete cascade, 0001_init.sql), so deleting a game
-- automatically wipes its rake rows too.
alter table public.game_players add column rake_paid boolean not null default false;

create table public.expenses (
  id bigint generated always as identity primary key,
  description text not null,
  amount numeric not null,
  date timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.expenses enable row level security;

create policy "expenses are publicly readable" on public.expenses
  for select using (true);

create policy "operators can insert expenses" on public.expenses
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can update expenses" on public.expenses
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can delete expenses" on public.expenses
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

-- One-off contributions from players outside the per-game rake (e.g. someone
-- chipping in extra toward a table purchase). Publicly viewable for the same
-- transparency reason as expenses; only operators can log/remove them.
create table public.donations (
  id bigint generated always as identity primary key,
  person_id bigint not null references public.players(id),
  amount numeric not null,
  date timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.donations enable row level security;

create policy "donations are publicly readable" on public.donations
  for select using (true);

create policy "operators can insert donations" on public.donations
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can update donations" on public.donations
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can delete donations" on public.donations
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );
