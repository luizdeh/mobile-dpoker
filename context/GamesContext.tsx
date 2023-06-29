import { createContext, useEffect, useState } from 'react';
import { Game, GamePlayer, PlayerList, DataContextType } from '../lib/types';
import { addPlayer } from '../utils/db/addPlayer';
import { getPlayers } from '../utils/db/fetchPlayers';
import { getAllGames } from '../utils/db/getAllGames';
import { getGamePlayers } from '../utils/db/getGamePlayers';

export const GamesContext = createContext<DataContextType>({
  games: null,
  players: null,
  gamesPlayed: null,
  addPerson: () => { },
});
// export const GamesContext = createContext<any>({});

// interface Props {
//   children: React.ReactNode;
// }

export const GamesContextProvider = ({ children }: any) => {
  const [games, setGames] = useState<Game[] | null>(null);
  const [players, setPlayers] = useState<PlayerList[] | null>(null);
  const [gamesPlayed, setGamesPlayed] = useState<GamePlayer[] | null>(null);

  useEffect(() => {
    (async () => {
      const fetchPlayers = await getPlayers();
      if (fetchPlayers.length) setPlayers(fetchPlayers);

      const fetchGames = await getAllGames();
      if (fetchGames.length) setGames(fetchGames.filter((game: Game) => game.status === 'CLOSED'));

      const fetchGamePlayers = await getGamePlayers();
      if (fetchGamePlayers.length) setGamesPlayed(fetchGamePlayers);
    })();
  }, []);

  const addPerson = async (name: string, callback: () => void) => {
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
    gamesPlayed,
    setGames,
    setPlayers,
    setGamesPlayed,
    addPerson,
  };

  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
};
