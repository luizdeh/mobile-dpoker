import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Text, Center, Box, Spinner, VStack, HStack, Button, Select, IconButton, ScrollView } from 'native-base';
import { AntDesign } from '@expo/vector-icons';
import { PlayerList } from '../lib/types';
import { GamesContext } from '../context/GamesContext';
import { checkedPlayerScores, makeMatchups } from '../utils/matchups';

const MIN_SLOTS = 2;
const MAX_EXTRA_SLOTS = 7;
const MAX_SLOTS = MIN_SLOTS + MAX_EXTRA_SLOTS;

export default function Matchups() {
  const { games, players, gamePlayers } = useContext(GamesContext);

  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState<any[]>([]);

  const [filteredStats, setFilteredStats] = useState<any[]>([]);

  const [selections, setSelections] = useState<(number | null)[]>(Array(MIN_SLOTS).fill(null));

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

  const selectedIds = useMemo(
    () => selections.filter((id): id is number => id !== null),
    [selections]
  );

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    const filter = stats.filter((game: any) =>
      selectedIds.every((playerId: number) => game.playerIds.includes(playerId))
    );
    setFilteredStats(filter);
  }, [selectedIds, stats]);

  const isTakenElsewhere = (playerId: number, slotIndex: number) =>
    selectedIdSet.has(playerId) && selections[slotIndex] !== playerId;

  const updateSelection = (slotIndex: number, value: string) => {
    const playerId = value === '' ? null : Number(value);
    setSelections((prev) => {
      const next = [...prev];
      next[slotIndex] = playerId;
      return next;
    });
  };

  const addSlot = () => {
    setSelections((prev) => (prev.length < MAX_SLOTS ? [...prev, null] : prev));
  };

  const removeSlot = (slotIndex: number) => {
    setSelections((prev) => prev.filter((_, idx) => idx !== slotIndex));
  };

  const clearSelections = () => {
    setSelections((prev) => prev.map(() => null));
  };

  const hasSelections = selectedIds.length > 0;

  const renderCheckedPlayerScores = () => {
    const summedArray = checkedPlayerScores(selectedIds, filteredStats);
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
        <ScrollView>
          <VStack space={2}>
            {selections.map((selectedId, idx) => (
              <HStack key={idx} alignItems="center" space={2}>
                <Select
                  flex={1}
                  selectedValue={selectedId !== null ? String(selectedId) : ''}
                  placeholder={`PLAYER ${idx + 1}`}
                  accessibilityLabel={`Player ${idx + 1}`}
                  onValueChange={(value) => updateSelection(idx, value)}
                >
                  <Select.Item label="— CLEAR —" value="" />
                  {[...(players ?? [])]
                    .sort((a: PlayerList, b: PlayerList) => a.name.localeCompare(b.name))
                    .map((player: PlayerList) => (
                    <Select.Item
                      key={player.id}
                      label={player.name.toUpperCase()}
                      value={String(player.id)}
                      isDisabled={isTakenElsewhere(player.id, idx)}
                    />
                  ))}
                </Select>
                {idx >= MIN_SLOTS ? (
                  <IconButton
                    variant="ghost"
                    colorScheme="blueGray"
                    _icon={{ as: AntDesign, name: 'closecircleo', size: 'sm' }}
                    onPress={() => removeSlot(idx)}
                  />
                ) : null}
              </HStack>
            ))}
          </VStack>
          {selections.length < MAX_SLOTS ? (
            <Button
              onPress={addSlot}
              variant="outline"
              colorScheme="tertiary"
              width="100%"
              mt="4"
              minHeight="10"
              borderRadius="none"
            >
              + ADD PLAYER
            </Button>
          ) : null}
          <VStack px={2} mt={4}>
            <HStack justifyItems="center">
              <Text>Games found: </Text>
              <Text bold>{filteredStats.length} </Text>
              <Text>/ {stats.length}</Text>
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
        </ScrollView>
      )}
    </Box>
  );
}
