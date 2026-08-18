-- Some tournaments allow more than one re-buy per player. Defaults to 1 to
-- match every tournament created before this column existed.
alter table public.tournaments
  add column max_rebuys int not null default 1;
