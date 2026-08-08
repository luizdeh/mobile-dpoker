-- Only admins (not operators) can delete a player — add/update stay open to
-- both roles via the existing 0001_init.sql policies.
--
-- Note: game_players.person_id references players(id) with no ON DELETE
-- clause (default RESTRICT), so Postgres already refuses to delete a player
-- who has ever been added to any game, open or closed. That FK is what
-- actually enforces "only if the player has no games played" — this policy
-- just narrows who's allowed to attempt it at all.
create policy "admins can delete players" on public.players
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
