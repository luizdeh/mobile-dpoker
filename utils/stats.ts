import { Game, GamePlayer, PlayerList } from "../lib/types";

export const getStats = (
  games: Game[],
  gamePlayer: GamePlayer[],
  players: PlayerList[]
) => {
  return games.map((game: Game) => {
    const game_played = gamePlayer.filter(
      (item: GamePlayer) => item.game_id === game.id
    );
    let sum_of_chips = 0;
    game_played.length >= 1
      ? (sum_of_chips = game_played.reduce((a, b) => a + b.chips, 0))
      : 0;
    const active_players = game_played.map((player: GamePlayer) => {
      const equity = player.chips / sum_of_chips || 0;
      const investment =
        (game.buy_in_value + player.quantity_rebuy * game.re_buy_value) *
        game.chip_value;
      const name = players.find(
        (playerName: PlayerList) => playerName.id === player.person_id
      )?.name;
      const prize = player.chips * game.chip_value;
      const profit = prize - investment;
      return { ...player, equity, investment, name, prize, profit };
    });
    const playerIds = active_players.map((item: any) => item.person_id);
    return { ...game, active_players, sum_of_chips, playerIds };
  });
};
