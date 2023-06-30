import React, { useContext, useEffect, useState } from 'react';
import { Text, Center, Box, Spinner, VStack, HStack, Button } from 'native-base';
import { Game, GamePlayer, Player, PlayerList } from '../lib/types';
import PlayersCheckboxes from '../components/PlayersCheckboxes';
import { GamesContext } from '../context/GamesContext';
import { checkedPlayerScores, makeMatchups } from '../utils/matchups';

export default function GamesPlayed() {
  const { games, players, gamePlayers } = useContext(GamesContext);

  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState<any[]>([]);

  const [filteredStats, setFilteredStats] = useState<any[]>([]);

  const [playerCheckboxes, setPlayerCheckboxes] = useState<any[]>([]);

  useEffect(() => {
    if (games && gamePlayers && players) {
      const { gamesPlayed, checkbox } = makeMatchups(games, gamePlayers, players);
      setStats(gamesPlayed);
      setPlayerCheckboxes(checkbox);
    }
  }, []);

  useEffect(() => {
    if (stats.length) {
      setFilteredStats(stats);
      setIsLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    const temp = [...playerCheckboxes];
    const updated = temp.filter((item: any) => item.checkbox).map((subItem: any) => subItem.id);

    const filter = stats.filter((game: any) => {
      const playerIds = game.playerIds;
      return updated.every((playerId: number) => playerIds.includes(playerId));
    });

    setFilteredStats(filter);
  }, [playerCheckboxes]);

  const cleanCheckboxes = () => {
    const updatedCheckboxes = playerCheckboxes.map((checkbox: any) => {
      return { ...checkbox, checkbox: false };
    });
    setPlayerCheckboxes(updatedCheckboxes);
  };

  const renderCheckedPlayerScores = () => {
    const summedArray = checkedPlayerScores(playerCheckboxes, filteredStats);
    return summedArray.map((item: any, idx: number) => {
      const [name, ...lastName] = item.name.split(' ').filter(Boolean);
      const myName = lastName.length && item.name.length >= 11 ? `${name} ${lastName[0][0]}.` : `${name} ${lastName}`;
      return (
        <HStack key={idx} py={1} backgroundColor={idx % 2 === 0 ? 'white' : 'blueGray.100'}>
          <Text flex={2} fontSize="xs">
            {myName.toUpperCase()}
          </Text>
          <Text flex={1} fontSize="xs" textAlign="center">
            {item.quantity_rebuy}
          </Text>
          <Text flex={1} fontSize="xs" textAlign="center">
            {item.profit.toFixed(2)}
          </Text>
          <Text flex={1} fontSize="xs" textAlign="center">
            {(item.equity / filteredStats.length).toFixed(2)}
          </Text>
        </HStack>
      );
    });
  };

  return (
    <Box h="100%" px="4" py="2" backgroundColor="white">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.600" />
        </Center>
      ) : (
        <>
          <Box flexDirection="row" flexWrap="wrap">
            {playerCheckboxes.map((player: PlayerList) => {
              return <PlayersCheckboxes key={player.id} player={player} updateCheckboxes={setPlayerCheckboxes} />;
            })}
          </Box>
          <br />
          <VStack px={2}>
            <HStack justifyItems="center">
              <Text>Games found: </Text>
              <Text bold>{filteredStats.length} </Text>
              <Text>/ {stats.length}</Text>
            </HStack>
            <Button
              isDisabled={playerCheckboxes.some((item: any) => item.checkbox == true) ? false : true}
              onPress={cleanCheckboxes}
              variant="solid"
              colorScheme="blueGray"
              width="100%"
              my="2"
              minHeight="10"
              borderRadius="none"
            >
              CLEAN SEARCH
            </Button>
            {playerCheckboxes.some((item: any) => item.checkbox == true) ? (
              <HStack borderBottomColor="black" borderBottomWidth="1" mt="4">
                <Text flex={2} fontSize="xs" bold>
                  PLAYER
                </Text>
                <Text flex={1} fontSize="xs" textAlign="center" bold>
                  REBUYS
                </Text>
                <Text flex={1} fontSize="xs" textAlign="center" bold>
                  PROFIT
                </Text>
                <Text flex={1} fontSize="xs" textAlign="center" bold>
                  EQUITY
                </Text>
              </HStack>
            ) : null}
            {filteredStats.length ? (
              renderCheckedPlayerScores()
            ) : (
              <Text textAlign="center" fontSize="xs" my="1">
                No games played between selected players.
              </Text>
            )}
          </VStack>
        </>
      )}
    </Box>
  );
}
