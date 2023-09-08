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

  useEffect(() => {
    (async () => {
      const fetchPlayers = await getPlayers();
      if (fetchPlayers.length) setPlayers(fetchPlayers);

      const fetchGames = await getAllGames();
      if (fetchGames.length) setGames(fetchGames.filter((game: Game) => game.status === 'CLOSED'));

      const fetchGamePlayers = await getGamePlayers();
      if (fetchGamePlayers.length) setGamePlayers(fetchGamePlayers);

      if (fetchGames.length && fetchPlayers.length && fetchGamePlayers.length) setInitialFetch(true);
    })();
  }, []);

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
    setGames,
    setPlayers,
    setGamePlayers,
    stats,
    gamesPlayed,
    addNewPlayer,
  };

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
};
