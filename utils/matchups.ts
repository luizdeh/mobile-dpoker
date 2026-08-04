import { Game, GamePlayer, Player, PlayerList } from '../lib/types';

export const makeMatchups = (games: Game[], gamePlayers: GamePlayer[], players: PlayerList[]) => {
  const nameById = new Map(players.map((player: PlayerList) => [player.id, player.name]));

  const gamePlayersByGameId = new Map<number, GamePlayer[]>();
  for (const gamePlayer of gamePlayers) {
    const bucket = gamePlayersByGameId.get(gamePlayer.game_id);
    if (bucket) bucket.push(gamePlayer);
    else gamePlayersByGameId.set(gamePlayer.game_id, [gamePlayer]);
  }

  const gamesPlayed = games.map((game: Game) => {
    const game_played = gamePlayersByGameId.get(game.id) ?? [];
    let sum_of_chips = 0;
    game_played.length >= 1 ? (sum_of_chips = game_played.reduce((a, b) => a + b.chips, 0)) : 0;
    const active_players = game_played.map((player: GamePlayer) => {
      const equity = player.chips / sum_of_chips || 0;
      const investment = (game.buy_in_value + player.quantity_rebuy * game.re_buy_value) * game.chip_value;
      const name = nameById.get(player.person_id);
      const prize = player.chips * game.chip_value;
      const profit = prize - investment;
      return { ...player, equity, investment, name, prize, profit };
    });
    const playerIds = active_players.map((item: any) => item.person_id);
    return { ...game, active_players, sum_of_chips, playerIds };
  });

  return { gamesPlayed };
};

export const checkedPlayerScores = (selectedIds: number[], stats: any) => {
  const players = stats.flatMap((game: any) => {
    const each = selectedIds.flatMap((id: number) =>
      game.active_players.find((subItem: Player) => subItem.person_id === id)
    );
    return each;
  });

  const summedObjects = players.reduce((result: any, obj: any) => {
    if (!obj || !('person_id' in obj)) return result;
    const { person_id, ...rest } = obj;
    if (!result[person_id]) {
      result[person_id] = { person_id, ...rest };
    } else {
      for (const key in rest) {
        if (Object.prototype.hasOwnProperty.call(rest, key) && typeof rest[key] === 'number') {
          result[person_id][key] = (result[person_id][key] || 0) + rest[key];
        }
      }
    }
    return result;
  }, {});

  return Object.values(summedObjects).sort((a: any, b: any) => b.profit - a.profit)
}