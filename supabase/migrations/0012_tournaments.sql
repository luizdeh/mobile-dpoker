-- Tournaments, kept fully separate from games/game_players so cash game and
-- tournament data (and their stats) never mix.

create table public.tournaments (
  id bigint generated always as identity primary key,
  date timestamptz not null default now(),
  buy_in_value numeric not null,
  re_buy_value numeric not null,
  status text not null default 'LOBBY',
  locked_by text,
  locked_at timestamptz,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

-- Same reasoning as games_single_open_game (0004_game_locking.sql): at most
-- one open (LOBBY/ACTIVE) tournament app-wide, enforced at the DB level.
create unique index tournaments_single_open
  on public.tournaments ((true))
  where status in ('LOBBY', 'ACTIVE');

-- One row per entrant. finish_position: 1 = champion, N = first player
-- eliminated (natural placement numbering). Null while the tournament is
-- still being played. Points aren't stored — they're a pure function of
-- finish_position and the tournament's total entrant count (computed in
-- utils/tournamentStats.ts), so there's nothing to keep in sync.
--
-- prize_amount/is_split are set once when the tournament closes: prize_amount
-- defaults from the payout percentage for that finish_position times the
-- total pool, but can be overridden by hand (and is_split flagged) when
-- players agree to split money rather than following the strict percentages.
create table public.tournament_players (
  id bigint generated always as identity primary key,
  tournament_id bigint not null references public.tournaments(id) on delete cascade,
  person_id bigint not null references public.players(id),
  quantity_rebuy int not null default 0,
  finish_position int,
  prize_amount numeric not null default 0,
  is_split boolean not null default false,
  created_at timestamptz not null default now()
);

-- Prize structure, entered once by an admin after a tournament closes:
-- position 1 (champion) gets `percentage` percent of the total buy-in+rebuy
-- pool, and so on. Drives the initial tournament_players.prize_amount calc.
create table public.tournament_payouts (
  id bigint generated always as identity primary key,
  tournament_id bigint not null references public.tournaments(id) on delete cascade,
  position int not null,
  percentage numeric not null,
  created_at timestamptz not null default now(),
  unique (tournament_id, position)
);

alter table public.tournaments enable row level security;
alter table public.tournament_players enable row level security;
alter table public.tournament_payouts enable row level security;

-- Same public-read / admin-or-operator-write pattern used throughout
-- (games, game_players, expenses, donations).
create policy "tournaments are publicly readable" on public.tournaments
  for select using (true);

create policy "operators can insert tournaments" on public.tournaments
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can update tournaments" on public.tournaments
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can delete tournaments" on public.tournaments
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "tournament_players are publicly readable" on public.tournament_players
  for select using (true);

create policy "operators can insert tournament_players" on public.tournament_players
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can update tournament_players" on public.tournament_players
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can delete tournament_players" on public.tournament_players
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "tournament_payouts are publicly readable" on public.tournament_payouts
  for select using (true);

create policy "operators can insert tournament_payouts" on public.tournament_payouts
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can update tournament_payouts" on public.tournament_payouts
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can delete tournament_payouts" on public.tournament_payouts
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );
