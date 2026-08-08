-- Delete was never granted for games/game_players (0001_init.sql only covers
-- select/insert/update). Needed so admins can delete a game from the app,
-- and so the game_players cascade delete (on delete cascade) doesn't get
-- silently blocked by RLS on the child table.

create policy "operators can delete games" on public.games
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );

create policy "operators can delete game_players" on public.game_players
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
  );
