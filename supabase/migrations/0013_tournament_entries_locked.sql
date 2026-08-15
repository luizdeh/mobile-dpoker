-- Replaces the placeholder auto-cutoff (6th place reached) with an explicit,
-- admin-triggered, one-way lock: once set, ActiveTournament stops allowing
-- new entries and re-buys for the rest of the tournament.
alter table public.tournaments
  add column entries_locked boolean not null default false;
