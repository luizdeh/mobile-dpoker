import { Game, GamePlayer, Player, PlayerList } from '../lib/types';

export const makeMatchups = (games: Game[], gamePlayers: GamePlayer[], players: PlayerList[]) => {
  const gamesPlayed = games.map((game: Game) => {
    const game_played = gamePlayers.filter((item: GamePlayer) => item.game_id === game.id);
    let sum_of_chips = 0;
    game_played.length >= 1 ? (sum_of_chips = game_played.reduce((a, b) => a + b.chips, 0)) : 0;
    const active_players = game_played.map((player: GamePlayer) => {
      const equity = player.chips / sum_of_chips || 0;
      const investment = (game.buy_in_value + player.quantity_rebuy * game.re_buy_value) * game.chip_value;
      const name = players.find((playerName: PlayerList) => playerName.id === player.person_id)?.name;
      const prize = player.chips * game.chip_value;
      const profit = prize - investment;
      return { ...player, equity, investment, name, prize, profit };
    });
    const playerIds = active_players.map((item: any) => item.person_id);
    return { ...game, active_players, sum_of_chips, playerIds };
  });

  const checkbox = players.map((player: PlayerList) => {
    return { id: player.id, name: player.name, checkbox: false };
  });

  return { gamesPlayed, checkbox };
};

export const checkedPlayerScores = (checkboxes: any, stats: any) => {
  const temp = [...checkboxes];
  const updated = temp.filter((item: any) => item.checkbox).map((subItem: any) => subItem.id);

  const players = stats.flatMap((game: any) => {
    const each = updated.flatMap((item: any) =>
      game.active_players.find((subItem: Player) => subItem.person_id === item)
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

  return Object.values(summedObjects).sort((a: any, b: any) => b.profit - a.profit);
};
