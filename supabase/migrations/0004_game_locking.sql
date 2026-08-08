-- Enforce at most one open (LOBBY/ACTIVE) game across the whole app, at the
-- database level, so this can't be bypassed by a stale UI check or a race
-- between two devices creating a game at the same moment.
--
-- NOTE: if you currently have more than one LOBBY/ACTIVE game sitting in the
-- games table (from earlier testing), this CREATE UNIQUE INDEX will fail with
-- a duplicate-key error. Close or delete the extras first, e.g.:
--   select id, status, date from public.games where status in ('LOBBY', 'ACTIVE');
create unique index games_single_open_game
  on public.games ((true))
  where status in ('LOBBY', 'ACTIVE');

-- Per-device lock: whichever device/browser is actively running a game
-- claims it here, so a second device can't open the same game and make
-- conflicting changes at the same time.
alter table public.games add column locked_by text;
alter table public.games add column locked_at timestamptz;
