import { createContext, useEffect, useState } from 'react';
import { Game, GamePlayer, PlayerList, DataContextType } from '../lib/types';
import { addPlayer } from '../utils/db/addPlayer';
import { getPlayers } from '../utils/db/fetchPlayers';
import { getAllGames } from '../utils/db/getAllGames';
import { getGamePlayers } from '../utils/db/getGamePlayers';
import { getStats, makeOverallStats } from '../utils/stats';

export const GamesContext = createContext<DataContextType>({
  games: null,
  players: null,
  gamePlayers: null,
  fetchGames: () => { },
  fetchPlayers: () => { },
  setGames: () => { },
  setPlayers: () => { },
  setGamePlayers: () => { },
  stats: null,
  gamesPlayed: null,
  addNewPlayer: () => { },
});

export const GamesContextProvider = ({ children }: any) => {
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<PlayerList[]>([]);
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);
  const [initialFetch, setInitialFetch] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [gamesPlayed, setGamesPlayed] = useState<any[]>([]);

  const fetchGames = async () => {
    const fetchGames = await getAllGames();
    if (fetchGames.length) setGames(fetchGames.filter((game: Game) => game.status === 'CLOSED'));
  }

  const fetchPlayers = async () => {
    const fetchPlayers = await getPlayers();
    if (fetchPlayers.length) setPlayers(fetchPlayers);
  }

  const fetchGamePlayers = async () => {
    const fetchGamePlayers = await getGamePlayers();
    if (fetchGamePlayers.length) setGamePlayers(fetchGamePlayers);
  }

  useEffect(() => {
    (async () => {
      await fetchPlayers()
      await fetchGames()
      await fetchGamePlayers()
    })();
  }, []);

  useEffect(() => {
    if (players.length && games.length && gamePlayers.length) {
      setInitialFetch(true);
    }
  }, [players, games, gamePlayers]);

  useEffect(() => {
    if (initialFetch) {
      const overall = makeOverallStats(games, gamePlayers, players);
      setStats(overall);
      const gamesPlayed = getStats(games, gamePlayers, players);
      setGamesPlayed(gamesPlayed);
    }
  }, [initialFetch]);

  const addNewPlayer = async (name: string, callback: () => void) => {
    if (name) {
      await addPlayer(name);
      const allPlayers = await getPlayers();
      if (allPlayers) setPlayers(allPlayers);
    }
    callback();
  };

  const value = {
    games,
    players,
    gamePlayers,
    fetchGames,
    fetchPlayers,
    setGames,
    setPlayers,
    setGamePlayers,
    stats,
    gamesPlayed,
    addNewPlayer,
  };

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
};