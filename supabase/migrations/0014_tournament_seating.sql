-- Stores the one-time randomized table/seat assignment computed at
-- tournament creation (lib/seating.ts) so it can be displayed without
-- recomputation and stays stable regardless of later eliminations.
alter table public.tournaments
  add column seating jsonb;
