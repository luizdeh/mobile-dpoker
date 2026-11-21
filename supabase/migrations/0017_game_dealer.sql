-- The night's dealer doesn't pay rake (agreed by the players, starting with
-- game 234, shown in the app as 30/10/2026). One dealer per game, optional:
-- null means everyone pays. The dealer's game_players row stays (they still
-- play), it's just excluded from every rake total and from the paid count.
alter table public.games
  add column dealer_id bigint references public.players(id) on delete set null;

-- Backfill: Miguel (player 30) has dealt every cash game since the rule
-- started — 234 and 236.
update public.games set dealer_id = 30 where id in (234, 236);

-- In game 234 Miguel was ticked as paid only so the game would close; he
-- didn't actually pay that night.
update public.game_players set rake_paid = false
where game_id = 234 and person_id = 30;
