import { type Game, type GamePlayer, type PlayerList } from '../lib/types';

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
    const rebuys = game_played.map((item: GamePlayer) => item.quantity_rebuy).reduce((a: any, b: any) => a + b, 0);
    const playerIds = active_players.map((item: any) => item.person_id);
    const rebuyRatio = rebuys / game_played.length;
    return { ...game, active_players, sum_of_chips, playerIds, rebuys, rebuyRatio };
  });
};

export const ranking = (stats: any[], players: PlayerList[]) => {
  // "investment per game" and "rebuys per game" aren't performance metrics
  // (buying in for more isn't good or bad), so they're excluded from the
  // composite — only genuinely "higher is better" stats count.
  const rankedNames = ['average equity', 'profit per game', 'prize per game'];
  const perGame = stats.filter((item: any) => item.type === 'per game' && rankedNames.includes(item.name));

  // Games played is rewarded too, but as its own ranked category (1..N,
  // same scale as everything else) rather than an unbounded bonus — so
  // being active nudges the ranking without being able to override a real
  // performance gap.
  const gamesPlayedRanking = [...(perGame[0]?.stats ?? [])].sort((a: any, b: any) => b.games - a.games);

  const newMap = players.map((player: PlayerList) => {
    const pos: any[] = [];

    perGame.forEach((stat: any) => {
      const idx = stat.stats.findIndex((row: any) => row.person_id === player.id);
      if (idx !== -1) pos.push({ position: idx + 1, stat: stat.name });
    });

    const gamesIdx = gamesPlayedRanking.findIndex((row: any) => row.person_id === player.id);
    if (gamesIdx !== -1) pos.push({ position: gamesIdx + 1, stat: 'games played' });

    if (!pos.length) return null;

    const averagePosition = pos.reduce((a: number, b: any) => a + b.position, 0) / pos.length;
    return { ...player, pos, averagePosition };
  });

  return newMap.filter((item: any) => item !== null).sort((a: any, b: any) => a.averagePosition - b.averagePosition);
};

// Shared by makeOverallStats and makePlayerCard: joins every game_player row
// with its game's buy-in/rebuy/chip settings to compute equity, investment,
// prize and profit per row, plus a chronologically sorted game list.
const buildGameContext = (games: Game[], gamePlayers: GamePlayer[], players: PlayerList[]) => {
  const obj = games.map((game: Game) => {
    const game_played = gamePlayers.filter((item: GamePlayer) => item.game_id === game.id);
    const sum_of_chips = game_played.length >= 1 ? game_played.reduce((a, b) => a + b.chips, 0) : 0
    return { ...game, game_played, sum_of_chips };
  });

  const gameIDs = obj.map((item: any) => item.id);

  const allGames = gamePlayers.filter((item: GamePlayer) => gameIDs.includes(item.game_id)).map((item: any) => {
    const name = players.find((playerName: PlayerList) => playerName.id === item.person_id)?.name;
    const idx = obj.findIndex((idx: any) => idx.id === item.game_id);
    const foundGame = obj[idx];
    const { buy_in_value, re_buy_value, chip_value, sum_of_chips } = foundGame;
    const equity = item.chips / sum_of_chips;
    const investment = (buy_in_value + item.quantity_rebuy * re_buy_value) * chip_value;
    const prize = item.chips * chip_value;
    const profit = prize - investment;
    return { ...item, equity, investment, prize, profit, name, date: foundGame.date };
  });

  const sortedGames = [...obj].sort((a: any, b: any) => a.date.localeCompare(b.date));

  return { allGames, sortedGames };
};

// Walks a chronological true/false sequence and returns every completed run
// of consecutive `true`s found in it (including one still active at the
// end, if any). When `values` is passed, each run also carries the sum of
// values accumulated over it (e.g. the profit made during a win streak).
const collectRuns = (flags: boolean[], values?: number[]) => {
  const runs: { length: number; sum: number }[] = [];
  let length = 0;
  let sum = 0;
  flags.forEach((flag, idx) => {
    const value = values ? values[idx] : 0;
    if (flag) {
      length += 1;
      sum += value;
    } else if (length > 0) {
      runs.push({ length, sum });
      length = 0;
      sum = 0;
    }
  });
  if (length > 0) runs.push({ length, sum });
  return runs;
};

// The run still active at the end of the sequence, or a zero-length run if
// the sequence didn't end on a `true`.
const currentRun = (flags: boolean[], runs: { length: number; sum: number }[]) =>
  flags.length && flags[flags.length - 1] ? runs[runs.length - 1] : { length: 0, sum: 0 };

const longestRun = (runs: { length: number; sum: number }[]) =>
  runs.reduce((max, run) => (run.length > max.length ? run : max), { length: 0, sum: 0 });

export const makePlayerCard = (playerId: number, games: Game[], gamePlayers: GamePlayer[], players: PlayerList[]) => {
  const player = players.find((item: PlayerList) => item.id === playerId);
  if (!player) return null;

  const { allGames, sortedGames } = buildGameContext(games, gamePlayers, players);

  const myGames = allGames
    .filter((game: any) => game.person_id === playerId)
    .sort((a: any, b: any) => a.date.localeCompare(b.date));

  const games_played = myGames.length;
  const investments = myGames.reduce((a: number, b: any) => a + b.investment, 0);
  const prize = myGames.reduce((a: number, b: any) => a + b.prize, 0);
  const profit = prize - investments;
  const average_profit = games_played ? profit / games_played : 0;
  const rebuys = myGames.reduce((a: number, b: any) => a + b.quantity_rebuy, 0);
  const rebuys_per_game = games_played ? rebuys / games_played : 0;
  const equitySum = myGames.reduce((a: number, b: any) => a + b.equity, 0);
  const average_equity = games_played ? equitySum / games_played : 0;

  const positive_games = myGames.filter((game: any) => game.profit > 0).length;
  const positive_ratio = games_played ? positive_games / games_played : 0;

  const bestGame = games_played ? myGames.reduce((a: any, b: any) => (b.profit > a.profit ? b : a)) : null;
  const worstGame = games_played ? myGames.reduce((a: any, b: any) => (b.profit < a.profit ? b : a)) : null;

  const attendanceFlags = sortedGames.map((game: any) =>
    gamePlayers.some((gp: GamePlayer) => gp.game_id === game.id && gp.person_id === playerId)
  );
  const attendanceRuns = collectRuns(attendanceFlags);
  const attendanceCurrent = currentRun(attendanceFlags, attendanceRuns);
  const attendanceLongest = longestRun(attendanceRuns);

  const profits = myGames.map((game: any) => game.profit);
  const winFlags = myGames.map((game: any) => game.profit > 0);
  const lossFlags = myGames.map((game: any) => game.profit < 0);
  const winRuns = collectRuns(winFlags, profits);
  const lossRuns = collectRuns(lossFlags, profits);
  const winCurrent = currentRun(winFlags, winRuns);
  const lossCurrent = currentRun(lossFlags, lossRuns);
  const winLongest = longestRun(winRuns);
  const lossLongest = longestRun(lossRuns);

  const games_since_joined = games_played
    ? sortedGames.filter((game: any) => game.date >= myGames[0].date).length
    : 0;
  const attendance_rate = games_since_joined ? games_played / games_since_joined : 0;

  return {
    id: player.id,
    name: player.name,
    games_played,
    profit,
    average_profit,
    average_equity,
    rebuys_per_game,
    positive_games,
    positive_ratio,
    best_game: bestGame ? { profit: bestGame.profit, date: bestGame.date } : null,
    worst_game: worstGame ? { profit: worstGame.profit, date: worstGame.date } : null,
    attendance_current: attendanceCurrent.length,
    attendance_longest: attendanceLongest.length,
    win_current: winCurrent.length,
    win_current_profit: winCurrent.sum,
    win_longest: winLongest.length,
    win_longest_profit: winLongest.sum,
    loss_current: lossCurrent.length,
    loss_current_profit: lossCurrent.sum,
    loss_longest: lossLongest.length,
    loss_longest_profit: lossLongest.sum,
    games_since_joined,
    attendance_rate,
  };
};

export const makeOverallStats = (games: Game[], gamePlayers: GamePlayer[], players: PlayerList[]) => {
  const { allGames, sortedGames } = buildGameContext(games, gamePlayers, players);

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
  // console.log({ playerTotals });

  const streakTotals: any[] = [];
  const allAttendanceRuns: any[] = [];
  const allWinRuns: any[] = [];
  const allLossRuns: any[] = [];

  players.forEach((player: PlayerList) => {
    const games_played = playerTotals.find((item: any) => item.id === player.id)?.games_played ?? 0;

    const attendanceFlags = sortedGames.map((game: any) =>
      gamePlayers.some((gp: GamePlayer) => gp.game_id === game.id && gp.person_id === player.id)
    );
    const attendanceRuns = collectRuns(attendanceFlags);
    const attendanceCurrent = currentRun(attendanceFlags, attendanceRuns);

    const myGames = allGames
      .filter((game: any) => game.person_id === player.id)
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
    const profits = myGames.map((game: any) => game.profit);
    const winFlags = myGames.map((game: any) => game.profit > 0);
    const lossFlags = myGames.map((game: any) => game.profit < 0);
    const winRuns = collectRuns(winFlags, profits);
    const lossRuns = collectRuns(lossFlags, profits);
    const winCurrent = currentRun(winFlags, winRuns);
    const lossCurrent = currentRun(lossFlags, lossRuns);

    streakTotals.push({
      id: player.id,
      name: player.name,
      games_played,
      attendance_current: attendanceCurrent.length,
      win_current: winCurrent.length,
      win_current_profit: winCurrent.sum,
      loss_current: lossCurrent.length,
      loss_current_profit: lossCurrent.sum,
    });

    const toEntry = (run: { length: number; sum: number }, withProfit: boolean) => ({
      person_id: player.id,
      name: player.name,
      stat: run.length,
      games: games_played,
      ...(withProfit ? { secondaryStat: run.sum } : {}),
    });

    attendanceRuns.forEach((run) => allAttendanceRuns.push(toEntry(run, false)));
    winRuns.forEach((run) => allWinRuns.push(toEntry(run, true)));
    lossRuns.forEach((run) => allLossRuns.push(toEntry(run, true)));
  });

  const makeStreakStat = (field: string, profitField?: string) =>
    streakTotals
      .map((item: any) => ({
        name: item.name,
        stat: item[field],
        games: item.games_played,
        statName: field,
        person_id: item.id,
        ...(profitField ? { secondaryStat: item[profitField] } : {}),
      }))
      .sort((a, b) => b.stat - a.stat)
      .filter((item: any) => item.games > 1);

  const makeRunsStat = (runs: any[]) =>
    [...runs].sort((a, b) => b.stat - a.stat).filter((item: any) => item.games > 1);

  const makeTop = (what: any) => {
    const temp = [...allGames];
    return temp
      .map((item: any) => {
        const top = item[what];
        const statName = what === 'prize' ? 'top prizes' : what === 'profit' ? 'top profits' : 'largest equities';
        const games = playerTotals.find((player: any) => player.id === item.person_id)?.games_played;
        return {
          person_id: item.person_id,
          name: item.name,
          stat: top,
          statName,
          games,
          date: item.date,
        };
      })
      .sort((a, b) => b.stat - a.stat)
  };

  const makeBottom = (what: any) => {
    const temp = [...allGames];
    return temp
      .map((item: any) => {
        const bottom = item[what];
        const statName = what === 'profit' ? 'biggest losses' : `lowest ${what}`;
        const games = playerTotals.find((player: any) => player.id === item.person_id)?.games_played;
        return {
          person_id: item.person_id,
          name: item.name,
          stat: bottom,
          statName,
          games,
          date: item.date,
        };
      })
      .sort((a, b) => a.stat - b.stat)
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
      stats: makeTop('prize'),
      type: 'all time',
      category: 'Single-Game Records',
      show: false,
      limit: 10,
    },
    {
      name: 'largest equities in a game',
      stats: makeTop('equity'),
      type: 'all time',
      category: 'Single-Game Records',
      show: false,
      limit: 10,
    },
    {
      name: 'top profits in a game',
      stats: makeTop('profit'),
      type: 'all time',
      category: 'Single-Game Records',
      show: false,
      limit: 10,
    },
    {
      name: 'top losses in a game',
      stats: makeBottom('profit'),
      type: 'all time',
      category: 'Single-Game Records',
      show: false,
      limit: 10,
    },
    {
      name: 'all-time prizes',
      stats: makeStats('prize', 'down'),
      type: 'all time',
      category: 'All-Time Totals',
      show: false,
    },
    {
      name: 'all-time investments',
      stats: makeStats('investments', 'down'),
      type: 'all time',
      category: 'All-Time Totals',
      show: false,
    },
    {
      name: 'all-time profits',
      stats: makeStats('profit', 'down'),
      type: 'all time',
      category: 'All-Time Totals',
      show: false,
    },
    {
      name: 'all-time rebuys',
      stats: makeStats('rebuys', 'down'),
      type: 'all time',
      category: 'All-Time Totals',
      show: false,
    },
    {
      name: 'average equity',
      stats: makeStats('average_equity', 'down'),
      type: 'per game',
      category: 'Per-Game Averages',
      show: false,
    },
    {
      name: 'profit per game',
      stats: makeStats('profit_per_game', 'down'),
      type: 'per game',
      category: 'Per-Game Averages',
      show: false,
    },
    {
      name: 'prize per game',
      stats: makeStats('prize_per_game', 'down'),
      type: 'per game',
      category: 'Per-Game Averages',
      show: false,
    },
    {
      name: 'investment per game',
      stats: makeStats('investments_per_game', 'down'),
      type: 'per game',
      category: 'Per-Game Averages',
      show: false,
    },
    {
      name: 'rebuys per game',
      stats: makeStats('rebuys_per_game', 'down'),
      type: 'per game',
      category: 'Per-Game Averages',
      show: false,
    },
    {
      name: 'current attendance streak',
      stats: makeStreakStat('attendance_current'),
      type: 'all time',
      category: 'Streaks',
      show: false,
      decimals: 0,
      currentOnly: true,
    },
    {
      name: 'longest attendance streak',
      stats: makeRunsStat(allAttendanceRuns),
      type: 'all time',
      category: 'Streaks',
      show: false,
      decimals: 0,
      limit: 10,
    },
    {
      name: 'current win streak',
      stats: makeStreakStat('win_current', 'win_current_profit'),
      type: 'all time',
      category: 'Streaks',
      show: false,
      decimals: 0,
      currentOnly: true,
    },
    {
      name: 'longest win streak',
      stats: makeRunsStat(allWinRuns),
      type: 'all time',
      category: 'Streaks',
      show: false,
      decimals: 0,
      limit: 10,
    },
    {
      name: 'current loss streak',
      stats: makeStreakStat('loss_current', 'loss_current_profit'),
      type: 'all time',
      category: 'Streaks',
      show: false,
      decimals: 0,
      currentOnly: true,
    },
    {
      name: 'longest loss streak',
      stats: makeRunsStat(allLossRuns),
      type: 'all time',
      category: 'Streaks',
      show: false,
      decimals: 0,
      limit: 10,
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

export const makeSummary = (games: Game[], players: PlayerList[]) => {
  let arr: any[] = []
  for (const player of players) {
    const stats = singlePlayerStats(player.id, games);
    const withName = { ...stats, name: player.name }
    stats.games > 1 ? arr.push(withName) : null
  }
  return arr
}

export const singlePlayerStats = (id: number, array: Game[]) => {
  const g = array
    .filter((game: any) => game.playerIds.includes(id))
    .map((item: any) => item.active_players.find((player: any) => player.person_id === id))
  const positive = g.filter((game: any) => game.profit > 0).length
  const ratio = positive / g.length
  const rebuys = g.reduce((a: any, b: any) => a + b.quantity_rebuy, 0)
  const equity = g.reduce((a: any, b: any) => a + b.equity, 0) / g.length
  return { id, positive, ratio: Number(ratio.toFixed(2)), rebuys, equity: Number(equity.toFixed(2)), games: g.length };
}