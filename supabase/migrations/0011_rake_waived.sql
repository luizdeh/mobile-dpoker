-- Lets an admin mark a rake-tracked game as a "free pass" (no rake charged),
-- e.g. a game that was mistakenly not raked at the time. The game keeps its
-- rake_value and still shows up in the Cash > RAKE list (so it's clear the
-- game happened and was deliberately not charged), but is excluded from
-- every rake money total (expected/collected/per-player), since nothing was
-- ever owed for it.
alter table public.games add column rake_waived boolean not null default false;
