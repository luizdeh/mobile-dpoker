-- One-off data fix, applied by hand in the SQL Editor on 2026-11-20.
--
-- Tournament 32 ended with two 6th places (Matheus, Miguel) and no 8th.
-- Finish position was assigned as "players still in", and Moki registered
-- late (after Felipe and Miguel were out), which pushed that count back up,
-- so Matheus reused 6th. Fixed in the app by renumbering eliminated players
-- whenever the field changes (commit 11e90c8).
--
-- Correct order with 8 entrants: Felipe 8th, Miguel 7th, Matheus 6th.
-- Guards on the old values make this safe to re-run.
update public.tournament_players set finish_position = 8
 where id = 385 and tournament_id = 32 and finish_position = 7;  -- felipe
update public.tournament_players set finish_position = 7
 where id = 389 and tournament_id = 32 and finish_position = 6;  -- Miguel
