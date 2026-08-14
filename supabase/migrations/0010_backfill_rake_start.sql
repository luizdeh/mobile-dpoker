-- Rake collection actually started with the game on 2026-02-20 (id 178:
-- Darlan, Emerson, Felipe, Flávio Coronel, Luiz André, Miguel, Nilceu).
-- Nothing before that ever had rake collected, so those games are left with
-- rake_value = null (excluded from rake tracking, see 0009's comment).
-- Every game from that one onward was rake-eligible at R$5/player and has
-- since been paid in person, so mark it collected here in one pass.

update public.games
set rake_value = 5
where date >= (select date from public.games where id = 178);

update public.game_players gp
set rake_paid = true
from public.games g
where gp.game_id = g.id
  and g.date >= (select date from public.games where id = 178);
