import React, { useEffect, useState } from 'react';
import { Center, Box, Spinner } from 'native-base';
import { getAllGames } from '../utils/db/getAllGames';
import { getPlayers } from '../utils/db/fetchPlayers';
import { Game, GamePlayer, PlayerList } from '../lib/types';
import { getGamePlayers } from '../utils/db/getGamePlayers';
import { ScrollView } from 'react-native';
import GameScoreboard from '../components/GameScoreboard';
import { getStats } from '../utils/stats';

export default function GamesPlayed() {
  const [isLoading, setIsLoading] = useState(true);

  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<PlayerList[]>([]);
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);

  const [initialFetch, setInitialFetch] = useState(false);

  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const fetchPlayers = await getPlayers();
      if (fetchPlayers) setPlayers(fetchPlayers);

      const fetchGames = await getAllGames();
      if (fetchGames) setGames(fetchGames.filter((game: Game) => game.status === 'CLOSED'));

      const fetchGamePlayers = await getGamePlayers();
      if (fetchGamePlayers) setGamePlayers(fetchGamePlayers);

      if (fetchGames.length && fetchPlayers.length && fetchGamePlayers.length) setInitialFetch(true);
    })();
  }, []);

  useEffect(() => {
    if (initialFetch) {
      const gamesPlayed = getStats(games, gamePlayers, players);
      setStats(gamesPlayed);
    }
  }, [initialFetch]);

  useEffect(() => {
    if (stats.length) {
      setIsLoading(false);
    }
    const getTheStats = (id: number, stat: string, mod: string, array: Game[], limit?: number, overUnder?: string) => {
      const games = array
        .filter((game: any) => game.playerIds.includes(id))
        .map((item: any) => item.active_players.find((player: any) => player.person_id === id))
        .filter((item: any) => (mod === 'positive' ? item[stat] > 0 : item[stat] < 0));
      let limits: any[] = [];
      if (limit) {
        limits = games.filter((game: any) => (overUnder === 'over' ? game[stat] > limit : game[stat] < limit));
      }
      return limits.length ? limits : games;
    };
    const gamesPlayedByPlayer = (array: Game[], id: number) => array.filter((game: any) => game.playerIds.includes(id));
    console.log(getTheStats(9, 'prize', 'positive', stats).length, gamesPlayedByPlayer(stats, 9).length);
    console.log(getTheStats(9, 'investment', 'positive', stats).length);
  }, [stats]);

  return (
    <Box h="100%" px="2" py="2" backgroundColor="black">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.600" />
        </Center>
      ) : (
        <ScrollView>
          {stats
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((game: any, index: number) => {
              return <GameScoreboard key={index} game={game} index={index} />;
            })}
        </ScrollView>
      )}
    </Box>
  );
}
