import React, { useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Text, Center, Box, Spinner, VStack, HStack, Button, Input, Pressable, Icon, ScrollView } from 'native-base';
import { AntDesign } from '@expo/vector-icons';
import { PlayerList } from '../lib/types';
import { GamesContext } from '../context/GamesContext';
import { checkedPlayerScores, makeMatchups } from '../utils/matchups';
import { getActivePlayerIds } from '../utils/stats';
import ActivePlayersToggle from '../components/ActivePlayersToggle';

const MAX_SLOTS = 9;

export default function Matchups({ navigation }: { navigation: any }) {
  const { games, players, gamePlayers } = useContext(GamesContext);

  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState<any[]>([]);

  const [filteredStats, setFilteredStats] = useState<any[]>([]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [search, setSearch] = useState('');

  const [onlyActive, setOnlyActive] = useState(false);

  const activePlayerIds = useMemo(
    () => getActivePlayerIds(games ?? [], gamePlayers ?? [], players ?? []),
    [games, gamePlayers, players]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ActivePlayersToggle value={onlyActive} onChange={setOnlyActive} />,
    });
  }, [navigation, onlyActive]);

  const sortedPlayers = useMemo(() => {
    const eligible = onlyActive ? (players ?? []).filter((player: PlayerList) => activePlayerIds.has(player.id)) : players ?? [];
    return [...eligible].sort((a: PlayerList, b: PlayerList) => a.name.localeCompare(b.name));
  }, [players, onlyActive, activePlayerIds]);

  useEffect(() => {
    if (!onlyActive) return;
    setSelectedIds((prev) => prev.filter((id) => activePlayerIds.has(id)));
  }, [onlyActive, activePlayerIds]);

  const visiblePlayers = useMemo(
    () => sortedPlayers.filter((player: PlayerList) => player.name.toLowerCase().includes(search.trim().toLowerCase())),
    [sortedPlayers, search]
  );

  const selectedPlayers = useMemo(
    () => sortedPlayers.filter((player: PlayerList) => selectedIds.includes(player.id)),
    [sortedPlayers, selectedIds]
  );

  useEffect(() => {
    if (games && gamePlayers && players) {
      const { gamesPlayed } = makeMatchups(games, gamePlayers, players);
      setStats(gamesPlayed);
    }
  }, []);

  useEffect(() => {
    if (stats.length) {
      setFilteredStats(stats);
      setIsLoading(false);
    }
  }, [stats]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    const filter = stats.filter((game: any) =>
      selectedIds.every((playerId: number) => game.playerIds.includes(playerId))
    );
    setFilteredStats(filter);
  }, [selectedIds, stats]);

  const togglePlayer = (playerId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(playerId)) return prev.filter((id) => id !== playerId);
      if (prev.length >= MAX_SLOTS) return prev;
      return [...prev, playerId];
    });
  };

  const clearSelections = () => {
    setSelectedIds([]);
  };

  const hasSelections = selectedIds.length > 0;

  const renderCheckedPlayerScores = () => {
    const summedArray = checkedPlayerScores(selectedIds, filteredStats);
    return summedArray.map((item: any, idx: number) => {
      const [name, ...lastName] = item.name.split(' ').filter(Boolean);
      const myName = lastName.length && item.name.length >= 11 ? `${name} ${lastName[0][0]}.` : `${name} ${lastName}`;
      return (
        <HStack key={idx} px={2} py={1} backgroundColor={idx % 2 === 0 ? 'white' : 'blueGray.100'}>
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
    <Box h="100%" px="4" py="2" backgroundColor="black">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.600" />
        </Center>
      ) : (
        <>
        <VStack flex={1}>
          <VStack space={2} pb={2}>
            <HStack justifyContent="space-between" alignItems="baseline" px={1}>
              <Text fontSize="10" color="blueGray.400">PLAYERS</Text>
              <Text fontSize="10" color="blueGray.400">{selectedIds.length} / {MAX_SLOTS} SELECTED</Text>
            </HStack>
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="SEARCH PLAYERS"
              color="white"
              placeholderTextColor="blueGray.400"
              borderColor="blueGray.700"
              InputRightElement={
                search ? (
                  <Pressable onPress={() => setSearch('')} px={3} py={2}>
                    <Icon as={AntDesign} name="close" size="xs" color="blueGray.400" />
                  </Pressable>
                ) : undefined
              }
            />
            {selectedPlayers.length ? (
              <HStack flexWrap="wrap">
                {selectedPlayers.map((player: PlayerList) => (
                  <Button
                    key={player.id}
                    onPress={() => togglePlayer(player.id)}
                    size="xs"
                    borderRadius="full"
                    colorScheme="teal"
                    variant="solid"
                    m={0.5}
                    rightIcon={<Icon as={AntDesign} name="close" size="2xs" />}
                  >
                    {player.name.toUpperCase()}
                  </Button>
                ))}
              </HStack>
            ) : null}
          </VStack>
          <ScrollView flex={1}>
            {visiblePlayers.map((player: PlayerList) => {
              const isSelected = selectedIdSet.has(player.id);
              const isDisabled = !isSelected && selectedIds.length >= MAX_SLOTS;
              return (
                <Pressable key={player.id} onPress={() => togglePlayer(player.id)} isDisabled={isDisabled}>
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    px={3}
                    py={3}
                    borderBottomWidth={1}
                    borderColor="blueGray.800"
                    backgroundColor={isSelected ? 'blueGray.800' : 'transparent'}
                    opacity={isDisabled ? 0.4 : 1}
                  >
                    <Text color={isSelected ? 'teal.300' : 'white'} bold={isSelected} fontSize="sm">
                      {player.name.toUpperCase()}
                    </Text>
                    {isSelected ? (
                      <Icon as={AntDesign} name="checkcircle" size="sm" color="teal.300" />
                    ) : null}
                  </HStack>
                </Pressable>
              );
            })}
            {!visiblePlayers.length ? (
              <Text textAlign="center" fontSize="xs" color="blueGray.400" mt={4}>
                No players match "{search}".
              </Text>
            ) : null}
          </ScrollView>
        </VStack>
        <ScrollView maxH="45%">
          <VStack px={2} mt={4}>
            <HStack justifyItems="center">
              <Text color="blueGray.400">Games found: </Text>
              <Text color="white" bold>{filteredStats.length} </Text>
              <Text color="blueGray.400">/ {stats.length}</Text>
            </HStack>
            <Button
              isDisabled={!hasSelections}
              onPress={clearSelections}
              variant="solid"
              colorScheme="blueGray"
              width="100%"
              my="2"
              minHeight="10"
              borderRadius="none"
            >
              CLEAN SEARCH
            </Button>
            {hasSelections ? (
              <HStack backgroundColor="blueGray.800" borderRadius="sm" px={2} py={1.5} mt="4">
                <Text flex={2} fontSize="xs" bold color="teal.300" letterSpacing="lg">
                  PLAYER
                </Text>
                <Text flex={1} fontSize="xs" textAlign="center" bold color="teal.300" letterSpacing="lg">
                  REBUYS
                </Text>
                <Text flex={1} fontSize="xs" textAlign="center" bold color="teal.300" letterSpacing="lg">
                  PROFIT
                </Text>
                <Text flex={1} fontSize="xs" textAlign="center" bold color="teal.300" letterSpacing="lg">
                  EQUITY
                </Text>
              </HStack>
            ) : null}
            {filteredStats.length ? (
              renderCheckedPlayerScores()
            ) : (
              <Text textAlign="center" fontSize="xs" my="1" color="blueGray.400">
                No games played between selected players.
              </Text>
            )}
          </VStack>
        </ScrollView>
        </>
      )}
    </Box>
  );
}
