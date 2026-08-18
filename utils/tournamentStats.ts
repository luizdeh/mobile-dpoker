import { type Tournament, type TournamentPlayer, type PlayerList } from '../lib/types';
import { ordinal } from '../lib/ordinal';

// Points are never stored — they're a pure function of finish_position (1 =
// champion) and how many people entered: the first player eliminated gets 1
// point, the champion gets `entrantCount` points.
const pointsFor = (finishPosition: number | null, entrantCount: number) =>
  finishPosition == null ? 0 : entrantCount - finishPosition + 1;

const investmentFor = (entry: TournamentPlayer, tournament: Tournament) =>
  tournament.buy_in_value + entry.quantity_rebuy * tournament.re_buy_value;

// Shared by getTournamentsPlayed and makeOverallTournamentStats: joins every
// tournament_players row with its tournament's buy-in/rebuy settings to
// compute investment/points/profit per row, plus per-tournament entrant
// counts.
const buildTournamentContext = (
  tournaments: Tournament[],
  tournamentPlayers: TournamentPlayer[],
  players: PlayerList[]
) => {
  const entrantCountByTournamentId = new Map<number, number>();
  tournamentPlayers.forEach((entry: TournamentPlayer) => {
    entrantCountByTournamentId.set(
      entry.tournament_id,
      (entrantCountByTournamentId.get(entry.tournament_id) ?? 0) + 1
    );
  });

  const tournamentById = new Map(tournaments.map((t: Tournament) => [t.id, t]));

  const allEntries = tournamentPlayers
    .filter((entry: TournamentPlayer) => tournamentById.has(entry.tournament_id))
    .map((entry: TournamentPlayer) => {
      const tournament = tournamentById.get(entry.tournament_id)!;
      const entrantCount = entrantCountByTournamentId.get(entry.tournament_id) ?? 0;
      const name = players.find((player: PlayerList) => player.id === entry.person_id)?.name;
      const investment = investmentFor(entry, tournament);
      const points = pointsFor(entry.finish_position, entrantCount);
      const profit = entry.prize_amount - investment;
      const is_itm = entry.prize_amount > 0;
      return { ...entry, name, investment, points, profit, is_itm, date: tournament.date };
    });

  const sortedTournaments = [...tournaments].sort((a: Tournament, b: Tournament) => a.date.localeCompare(b.date));

  return { allEntries, sortedTournaments, entrantCountByTournamentId };
};

// Per-tournament view for the TournamentsPlayed list/detail screens — one
// entry per tournament, its entries sorted champion-first (finish_position
// ascending, still-playing entries last).
export const getTournamentsPlayed = (
  tournaments: Tournament[],
  tournamentPlayers: TournamentPlayer[],
  players: PlayerList[]
) => {
  const { allEntries, entrantCountByTournamentId, sortedTournaments } = buildTournamentContext(
    tournaments,
    tournamentPlayers,
    players
  );

  // Chronological (oldest-first) numbering, independent of the newest-first display order below.
  const sequenceByTournamentId = new Map(sortedTournaments.map((t: Tournament, index: number) => [t.id, index + 1]));

  return tournaments
    .map((tournament: Tournament) => {
      const entries = allEntries
        .filter((entry: any) => entry.tournament_id === tournament.id)
        .sort((a: any, b: any) => (a.finish_position ?? Infinity) - (b.finish_position ?? Infinity));
      const entrant_count = entrantCountByTournamentId.get(tournament.id) ?? 0;
      const champion = entries.find((entry: any) => entry.finish_position === 1) ?? null;
      const playerIds = entries.map((entry: any) => entry.person_id);
      const sequence_number = sequenceByTournamentId.get(tournament.id) ?? 0;
      return { ...tournament, entries, entrant_count, champion, playerIds, sequence_number };
    })
    .sort((a: any, b: any) => b.date.localeCompare(a.date));
};

export const makePlayerTournamentCard = (
  playerId: number,
  tournaments: Tournament[],
  tournamentPlayers: TournamentPlayer[],
  players: PlayerList[]
) => {
  const player = players.find((item: PlayerList) => item.id === playerId);
  if (!player) return null;

  const { allEntries } = buildTournamentContext(tournaments, tournamentPlayers, players);
  const myEntries = allEntries
    .filter((entry: any) => entry.person_id === playerId)
    .sort((a: any, b: any) => a.date.localeCompare(b.date));

  const tournaments_played = myEntries.length;
  const wins = myEntries.filter((entry: any) => entry.finish_position === 1).length;
  const itm_count = myEntries.filter((entry: any) => entry.is_itm).length;
  const itm_percentage = tournaments_played ? itm_count / tournaments_played : 0;
  const total_points = myEntries.reduce((a: number, b: any) => a + b.points, 0);
  const average_points = tournaments_played ? total_points / tournaments_played : 0;
  const total_prize = myEntries.reduce((a: number, b: any) => a + b.prize_amount, 0);
  const total_investment = myEntries.reduce((a: number, b: any) => a + b.investment, 0);
  const net_earnings = total_prize - total_investment;

  const bestEntry = tournaments_played
    ? myEntries.reduce((a: any, b: any) => (b.profit > a.profit ? b : a))
    : null;
  const worstEntry = tournaments_played
    ? myEntries.reduce((a: any, b: any) => (b.profit < a.profit ? b : a))
    : null;

  return {
    id: player.id,
    name: player.name,
    tournaments_played,
    wins,
    itm_count,
    itm_percentage,
    total_points,
    average_points,
    total_prize,
    total_investment,
    net_earnings,
    best_result: bestEntry ? { profit: bestEntry.profit, date: bestEntry.date } : null,
    worst_result: worstEntry ? { profit: worstEntry.profit, date: worstEntry.date } : null,
  };
};

export const makeOverallTournamentStats = (
  tournaments: Tournament[],
  tournamentPlayers: TournamentPlayer[],
  players: PlayerList[]
) => {
  const { allEntries, entrantCountByTournamentId } = buildTournamentContext(tournaments, tournamentPlayers, players);

  const playerTotals = players.map((item: PlayerList) => {
    const myEntries = allEntries.filter((entry: any) => entry.person_id === item.id);
    const tournaments_played = myEntries.length;
    const wins = myEntries.filter((entry: any) => entry.finish_position === 1).length;
    const itm_count = myEntries.filter((entry: any) => entry.is_itm).length;
    const itm_percentage = tournaments_played ? itm_count / tournaments_played : 0;
    const total_points = myEntries.reduce((a: number, b: any) => a + b.points, 0);
    const average_points = tournaments_played ? total_points / tournaments_played : 0;
    const total_prize = myEntries.reduce((a: number, b: any) => a + b.prize_amount, 0);
    const total_investment = myEntries.reduce((a: number, b: any) => a + b.investment, 0);
    const net_earnings = total_prize - total_investment;
    return {
      id: item.id,
      name: item.name,
      tournaments_played,
      wins,
      itm_count,
      itm_percentage,
      total_points,
      average_points,
      total_prize,
      total_investment,
      net_earnings,
    };
  });

  // Players with a single tournament played are excluded from every leaderboard
  // unless they won that tournament, in which case they only ever appear on the
  // wins table (not points/ITM/prize/etc, where a single data point is misleading).
  const makeStats = (what: string, order: string) =>
    playerTotals
      .map((item: any) => ({
        name: item.name,
        stat: item[what],
        games: item.tournaments_played,
        statName: what,
        person_id: item.id,
      }))
      .filter((item: any) => item.games > 0)
      .filter((item: any) => item.games > 1 || (what === 'wins' && item.stat > 0))
      .sort((a, b) => (order === 'down' ? b.stat - a.stat : a.stat - b.stat));

  const gamesByPlayerId = new Map(playerTotals.map((item: any) => [item.id, item.tournaments_played]));
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

  // Single-tournament players are excluded here too — a lucky one-off prize or
  // profit shouldn't read as a "record" any more than their point average should.
  const eligibleEntries = allEntries.filter((entry: any) => (gamesByPlayerId.get(entry.person_id) ?? 0) > 1);

  const nameWithPlacement = (entry: any) =>
    `${entry.name} - ${entry.finish_position ? ordinal(entry.finish_position) : '—'}`;

  const highestPrizes = [...eligibleEntries]
    .filter((entry: any) => entry.prize_amount > 0)
    .sort((a: any, b: any) => b.prize_amount - a.prize_amount)
    .slice(0, 20)
    .map((entry: any) => ({
      name: nameWithPlacement(entry),
      stat: entry.prize_amount,
      secondaryLabel: formatDate(entry.date),
      statName: 'prize_amount',
      person_id: entry.person_id,
    }));

  const highestProfits = [...eligibleEntries]
    .sort((a: any, b: any) => b.profit - a.profit)
    .slice(0, 20)
    .map((entry: any) => ({
      name: nameWithPlacement(entry),
      stat: entry.profit,
      secondaryLabel: formatDate(entry.date),
      statName: 'profit',
      person_id: entry.person_id,
    }));

  const championByTournamentId = new Map<number, string>();
  const totalPayoutsByTournamentId = new Map<number, number>();
  allEntries.forEach((entry: any) => {
    if (entry.finish_position === 1) championByTournamentId.set(entry.tournament_id, entry.name);
    totalPayoutsByTournamentId.set(
      entry.tournament_id,
      (totalPayoutsByTournamentId.get(entry.tournament_id) ?? 0) + entry.prize_amount
    );
  });

  const biggestTournaments = tournaments
    .map((t: Tournament) => ({
      name: `${championByTournamentId.get(t.id) ?? '—'} ( ${formatDate(t.date)} ) - $${(totalPayoutsByTournamentId.get(t.id) ?? 0).toFixed(2)}`,
      stat: entrantCountByTournamentId.get(t.id) ?? 0,
      secondaryLabel: '',
      statName: 'entrant_count',
      person_id: t.id,
    }))
    .filter((item: any) => item.stat > 0)
    .sort((a: any, b: any) => b.stat - a.stat);

  // Longest run of consecutive wins across a player's tournaments in chronological order.
  const winningStreaks = players
    .map((player: PlayerList) => {
      const myEntries = allEntries
        .filter((entry: any) => entry.person_id === player.id)
        .sort((a: any, b: any) => a.date.localeCompare(b.date));
      let streak = 0;
      let current = 0;
      myEntries.forEach((entry: any) => {
        current = entry.finish_position === 1 ? current + 1 : 0;
        streak = Math.max(streak, current);
      });
      return { name: player.name, stat: streak, games: myEntries.length, statName: 'winning_streak', person_id: player.id };
    })
    .filter((item: any) => item.games > 1 && item.stat > 1)
    .sort((a: any, b: any) => b.stat - a.stat);

  const secondPlaceCounts = new Map<number, number>();
  allEntries.forEach((entry: any) => {
    if (entry.finish_position === 2) {
      secondPlaceCounts.set(entry.person_id, (secondPlaceCounts.get(entry.person_id) ?? 0) + 1);
    }
  });

  const secondWithoutWin = playerTotals
    .filter((item: any) => item.wins === 0)
    .map((item: any) => ({
      name: item.name,
      stat: secondPlaceCounts.get(item.id) ?? 0,
      games: item.tournaments_played,
      statName: 'second_place_count',
      person_id: item.id,
    }))
    .filter((item: any) => item.games > 1 && item.stat > 0)
    .sort((a: any, b: any) => b.stat - a.stat);

  const itmWithoutWin = playerTotals
    .filter((item: any) => item.wins === 0)
    .map((item: any) => ({
      name: item.name,
      stat: item.itm_count,
      games: item.tournaments_played,
      statName: 'itm_count',
      person_id: item.id,
    }))
    .filter((item: any) => item.games > 1 && item.stat > 0)
    .sort((a: any, b: any) => b.stat - a.stat);

  return [
    { name: 'wins', stats: makeStats('wins', 'down'), type: 'all time', category: 'Tournament Records', show: false, decimals: 0 },
    { name: 'ITM finishes', stats: makeStats('itm_count', 'down'), type: 'all time', category: 'Tournament Records', show: false, decimals: 0 },
    { name: 'ITM percentage', stats: makeStats('itm_percentage', 'down'), type: 'all time', category: 'Tournament Records', show: false },
    { name: 'biggest prizes', stats: highestPrizes, type: 'single tournament', category: 'Tournament Records', show: false },
    { name: 'biggest profits', stats: highestProfits, type: 'single tournament', category: 'Tournament Records', show: false },
    { name: 'biggest tournaments', stats: biggestTournaments, type: 'single tournament', category: 'Tournament Records', show: false, decimals: 0 },
    { name: 'biggest winning streak', stats: winningStreaks, type: 'all time', category: 'Tournament Records', show: false, decimals: 0 },
    { name: 'most ITMs without a win', stats: itmWithoutWin, type: 'all time', category: 'Tournament Records', show: false, decimals: 0 },
    { name: 'most 2nd place finishes without a win', stats: secondWithoutWin, type: 'all time', category: 'Tournament Records', show: false, decimals: 0 },
    { name: 'all-time points', stats: makeStats('total_points', 'down'), type: 'all time', category: 'All-Time Totals', show: false, decimals: 0 },
    { name: 'all-time prize money', stats: makeStats('total_prize', 'down'), type: 'all time', category: 'All-Time Totals', show: false },
    { name: 'all-time net earnings', stats: makeStats('net_earnings', 'down'), type: 'all time', category: 'All-Time Totals', show: false },
    { name: 'points per tournament', stats: makeStats('average_points', 'down'), type: 'per tournament', category: 'Per-Tournament Averages', show: false },
  ];
};
