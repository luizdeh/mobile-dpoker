import { Game, GamePlayer, PlayerList } from '../lib/types';

export const getStats = (games: Game[], gamePlayer: GamePlayer[], players: PlayerList[]) => {
  return games.map((game: Game) => {
    const game_played = gamePlayer.filter((item: GamePlayer) => item.game_id === game.id);
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
};

export const ranking = (stats: any[], players: PlayerList[], games: Game[]) => {
  const filtered = stats.filter((item: any) => item.type === 'per game' && item.name !== 'rebuys per game');

  const newMap = players.map((player: PlayerList) => {
    let pos: any = [];
    for (const stat of filtered) {
      for (let i = 0; i < stat.stats.length; i++) {
        if (stat.stats[i].person_id === player.id) {
          pos.push({
            name: player.name,
            id: player.id,
            games: stat.stats[i].games,
            position: i + 1,
            stat: stat.name,
          });
        }
      }
    }
    if (pos.length) {
      const reducedPos = pos.reduce((a: any, b: any) => {
        return a + b.position;
      }, 0);
      const qualifier = games.length - pos[0].games;
      return {
        ...player,
        pos,
        qualifier: qualifier,
        reducedPos,
        newPos: reducedPos - pos[0].games * 1.5,
      };
    }
  });
  return newMap.sort((a: any, b: any) => a.newPos - b.newPos);
};

export const makeOverallStats = (games: Game[], gamePlayers: GamePlayer[], players: PlayerList[]) => {
  const obj = games.map((game: Game) => {
    const game_played = gamePlayers.filter((item: GamePlayer) => item.game_id === game.id);
    let sum_of_chips = 0;
    game_played.length >= 1 ? (sum_of_chips = game_played.reduce((a, b) => a + b.chips, 0)) : 0;
    return { ...game, game_played, sum_of_chips };
  });

  const allGames = gamePlayers.map((item: any) => {
    const name = players.find((playerName: PlayerList) => playerName.id === item.person_id)?.name;
    const idx = obj.findIndex((idx: any) => idx.id === item.game_id);
    const copyObj = [...obj];
    const foundGame = copyObj[idx];
    const { buy_in_value, re_buy_value, chip_value, sum_of_chips } = foundGame;
    const equity = item.chips / sum_of_chips;
    const investment = (buy_in_value + item.quantity_rebuy * re_buy_value) * chip_value;
    const prize = item.chips * chip_value;
    return { ...item, equity, investment, prize, name };
  });

  const playerTotals = players.map((item: PlayerList) => {
    const myGames = allGames.filter((player: GamePlayer) => player.person_id === item.id);
    const rebuys = myGames.reduce((a, b) => a + b.quantity_rebuy, 0);
    const investments = myGames.reduce((a, b) => a + b.investment, 0);
    const prize = myGames.reduce((a, b) => a + b.prize, 0);
    const profit = prize - investments;
    const equitySum = myGames.reduce((a, b) => a + b.equity, 0);
    const average_equity = equitySum / myGames.length || 0;
    const perGame = (stat: number) => stat / myGames.length || 0;
    return {
      id: item.id,
      name: item.name,
      games_played: myGames.length,
      investments: investments,
      investments_per_game: perGame(investments),
      prize,
      prize_per_game: perGame(prize),
      profit,
      profit_per_game: perGame(profit),
      rebuys,
      rebuys_per_game: perGame(rebuys),
      average_equity,
    };
  });

  const makeTopFive = (what: any) => {
    const temp = [...allGames];
    return temp
      .map((item: any) => {
        const top = item[what];
        const statName = what === 'prize' ? 'top prizes' : 'largest equities';
        const games = playerTotals.find((player: any) => player.id === item.person_id)?.games_played;
        return {
          person_id: item.person_id,
          name: item.name,
          stat: top,
          statName,
          games,
        };
      })
      .sort((a, b) => b.stat - a.stat)
      .splice(0, 5);
  };

  const makeStats = (what: string, order: string) => {
    return playerTotals
      .map((item: any) => {
        const stat = item[what];
        return {
          name: item.name,
          stat: stat,
          games: item.games_played,
          statName: what,
          person_id: item.id,
        };
      })
      .sort((a, b) => (order == 'down' ? b.stat - a.stat : a.stat - b.stat))
      .filter((item: any) => item.games > 1);
  };

  return [
    {
      name: 'top prizes in a game',
      stats: makeTopFive('prize'),
      type: 'all time',
      show: false,
    },
    {
      name: 'largest equities in a game',
      stats: makeTopFive('equity'),
      type: 'all time',
      show: false,
    },
    {
      name: 'all-time prizes',
      stats: makeStats('prize', 'down'),
      type: 'all time',
      show: false,
    },
    {
      name: 'all-time investments',
      stats: makeStats('investments', 'up'),
      type: 'all time',
      show: false,
    },
    {
      name: 'all-time profits',
      stats: makeStats('profit', 'down'),
      type: 'all time',
      show: false,
    },
    {
      name: 'all-time rebuys',
      stats: makeStats('rebuys', 'up'),
      type: 'all time',
      show: false,
    },
    {
      name: 'average equity',
      stats: makeStats('average_equity', 'down'),
      type: 'per game',
      show: false,
    },
    {
      name: 'profit per game',
      stats: makeStats('profit_per_game', 'down'),
      type: 'per game',
      show: false,
    },
    {
      name: 'prize per game',
      stats: makeStats('prize_per_game', 'down'),
      type: 'per game',
      show: false,
    },
    {
      name: 'investment per game',
      stats: makeStats('investments_per_game', 'up'),
      type: 'per game',
      show: false,
    },
    {
      name: 'rebuys per game',
      stats: makeStats('rebuys_per_game', 'up'),
      type: 'per game',
      show: false,
    },
  ];
};

export const filterStats = (
  id: number,
  stat: string,
  mod: string,
  array: Game[],
  limit?: number,
  overUnder?: string
) => {
  const games = array
    .filter((game: any) => game.playerIds.includes(id))
    .map((item: any) => item.active_players.find((player: any) => player.person_id === id))
    .filter((item: any) => (mod === 'positive' ? item[stat] > 0 : item[stat] < 0));
  let limits: any[] = [];
  if (limit) {
    limits = games.filter((game: any) => (overUnder === 'over' ? game[stat] > limit : game[stat] < limit));
  }
  return limits.length ? limits : games;
  // const gamesPlayedByPlayer = (array: Game[], id: number) => array.filter((game: any) => game.playerIds.includes(id));
  // console.log(getTheStats(9, 'prize', 'positive', stats).length, gamesPlayedByPlayer(stats, 9).length);
  // console.log(getTheStats(9, 'investment', 'positive', stats).length);
};
