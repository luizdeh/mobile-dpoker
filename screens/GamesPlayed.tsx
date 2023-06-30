import React, { useContext, useEffect, useState } from 'react';
import { Center, Box, Spinner } from 'native-base';
import { ScrollView } from 'react-native';
import GameScoreboard from '../components/GameScoreboard';
import { GamesContext } from '../context/GamesContext';

export default function GamesPlayed() {
  const { games, players, gamePlayers, gamesPlayed } = useContext(GamesContext);

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    if (games?.length && gamePlayers?.length && players?.length && gamesPlayed?.length) {
      setStats(gamesPlayed);
      setIsLoading(false);
    }
  }, []);

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
