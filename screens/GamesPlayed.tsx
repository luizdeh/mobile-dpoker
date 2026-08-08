import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Center, Box, Spinner, IconButton, Modal, VStack, HStack, Select, Button, Text } from 'native-base'
import { SafeAreaView, ScrollView, StatusBar } from 'react-native'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import GameScoreboard from '../components/GameScoreboard'
import useGamesContext from '../context/useGamesContext'
import { PlayerList } from '../lib/types'

export default function GamesPlayed({ navigation }: { navigation: any }) {
  const { games, players, gamePlayers, gamesPlayed } = useGamesContext()

  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any[]>([])

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [yearFilter, setYearFilter] = useState('')
  const [playerCountExactFilter, setPlayerCountExactFilter] = useState('')
  const [playerCountMinFilter, setPlayerCountMinFilter] = useState('')
  const [playerSelections, setPlayerSelections] = useState<(number | null)[]>([null])

  useEffect(() => {
    if (games?.length && gamePlayers?.length && players?.length && gamesPlayed?.length) {
      setStats(gamesPlayed)
      setIsLoading(false)
    }
  }, [games, gamePlayers, players, gamesPlayed])

  const statsLength = stats.length

  const selectedPlayerIds = useMemo(
    () => playerSelections.filter((id): id is number => id !== null),
    [playerSelections]
  )
  const hasActiveFilters = !!(yearFilter || playerCountExactFilter || playerCountMinFilter || selectedPlayerIds.length)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          isDisabled={isLoading}
          icon={
            <Ionicons
              name="filter"
              size={22}
              color={isLoading ? '#94a3b8' : hasActiveFilters ? '#059669' : '#0f766e'}
            />
          }
          onPress={() => setFiltersOpen(true)}
        />
      ),
    })
  }, [navigation, hasActiveFilters, isLoading])

  // Memoized so opening/closing the filter modal (or any other unrelated
  // state change) doesn't force a full recompute + re-render of every
  // GameScoreboard row in what's an un-virtualized ScrollView.
  const sortedStats = useMemo(
    () => [...stats].sort((a, b) => b.date.localeCompare(a.date)),
    [stats]
  )

  const years = useMemo(
    () => Array.from(new Set(stats.map((game: any) => game.date.slice(0, 4)))).sort().reverse(),
    [stats]
  )
  const playerCounts = useMemo(
    () =>
      Array.from(new Set(stats.map((game: any) => game.active_players.length))).sort(
        (a: number, b: number) => a - b
      ),
    [stats]
  )
  const sortedPlayers = useMemo(
    () => [...(players ?? [])].sort((a: PlayerList, b: PlayerList) => a.name.localeCompare(b.name)),
    [players]
  )

  const isPlayerTakenElsewhere = (playerId: number, slotIndex: number) =>
    selectedPlayerIds.includes(playerId) && playerSelections[slotIndex] !== playerId

  const updatePlayerSelection = (slotIndex: number, value: string) => {
    const playerId = value === '' ? null : Number(value)
    setPlayerSelections((prev) => {
      const next = [...prev]
      next[slotIndex] = playerId
      return next
    })
  }

  const addPlayerSlot = () => setPlayerSelections((prev) => [...prev, null])

  const removePlayerSlot = (slotIndex: number) =>
    setPlayerSelections((prev) => prev.filter((_, idx) => idx !== slotIndex))

  const filteredStats = useMemo(
    () =>
      sortedStats
        .map((game: any, index: number) => ({ ...game, num: statsLength - index }))
        .filter((game: any) => {
          if (yearFilter && game.date.slice(0, 4) !== yearFilter) return false
          if (playerCountExactFilter && game.active_players.length !== Number(playerCountExactFilter)) return false
          if (playerCountMinFilter && game.active_players.length < Number(playerCountMinFilter)) return false
          if (selectedPlayerIds.length && !selectedPlayerIds.every((id) => game.playerIds.includes(id))) return false
          return true
        }),
    [sortedStats, statsLength, yearFilter, playerCountExactFilter, playerCountMinFilter, selectedPlayerIds]
  )

  const clearFilters = () => {
    setYearFilter('')
    setPlayerCountExactFilter('')
    setPlayerCountMinFilter('')
    setPlayerSelections([null])
  }

  return (
    <Box h="100%" px="2" py="2" backgroundColor="black">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.600" />
        </Center>
      ) : (
        <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
          <ScrollView style={{ marginHorizontal: 10 }}>
            {filteredStats.length ? (
              filteredStats.map((game: any) => <GameScoreboard key={game.id} game={game} num={game.num} />)
            ) : (
              <Center py={8}>
                <Text color="blueGray.400">No games match these filters.</Text>
              </Center>
            )}
          </ScrollView>
        </SafeAreaView>
      )}
      <Modal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>
            <Text fontSize="md" bold>Filter Games</Text>
          </Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <VStack space={1}>
                <Text fontSize="xs" bold>YEAR</Text>
                <Select selectedValue={yearFilter} placeholder="ALL YEARS" onValueChange={setYearFilter}>
                  <Select.Item label="ALL YEARS" value="" />
                  {years.map((year: string) => (
                    <Select.Item key={year} label={year} value={year} />
                  ))}
                </Select>
              </VStack>
              <VStack space={1}>
                <Text fontSize="xs" bold>PLAYERS IN GAME</Text>
                <HStack space={2}>
                  <VStack flex={1} space={1}>
                    <Text fontSize="10" color="blueGray.400">EXACTLY</Text>
                    <Select
                      selectedValue={playerCountExactFilter}
                      placeholder="ANY"
                      onValueChange={(value) => {
                        setPlayerCountExactFilter(value)
                        if (value) setPlayerCountMinFilter('')
                      }}
                    >
                      <Select.Item label="ANY" value="" />
                      {playerCounts.map((count: number) => (
                        <Select.Item key={count} label={String(count)} value={String(count)} />
                      ))}
                    </Select>
                  </VStack>
                  <VStack flex={1} space={1}>
                    <Text fontSize="10" color="blueGray.400">OR MORE</Text>
                    <Select
                      selectedValue={playerCountMinFilter}
                      placeholder="ANY"
                      onValueChange={(value) => {
                        setPlayerCountMinFilter(value)
                        if (value) setPlayerCountExactFilter('')
                      }}
                    >
                      <Select.Item label="ANY" value="" />
                      {playerCounts.map((count: number) => (
                        <Select.Item key={count} label={`${count} OR MORE`} value={String(count)} />
                      ))}
                    </Select>
                  </VStack>
                </HStack>
              </VStack>
              <VStack space={1}>
                <Text fontSize="xs" bold>PLAYERS</Text>
                {playerSelections.map((selectedId, idx) => (
                  <HStack key={idx} alignItems="center" space={2}>
                    <Select
                      flex={1}
                      selectedValue={selectedId !== null ? String(selectedId) : ''}
                      placeholder="ALL PLAYERS"
                      onValueChange={(value) => updatePlayerSelection(idx, value)}
                    >
                      <Select.Item label="ALL PLAYERS" value="" />
                      {sortedPlayers.map((player: PlayerList) => (
                        <Select.Item
                          key={player.id}
                          label={player.name.toUpperCase()}
                          value={String(player.id)}
                          isDisabled={isPlayerTakenElsewhere(player.id, idx)}
                        />
                      ))}
                    </Select>
                    {idx > 0 ? (
                      <IconButton
                        variant="ghost"
                        colorScheme="blueGray"
                        _icon={{ as: AntDesign, name: 'closecircleo', size: 'sm' }}
                        onPress={() => removePlayerSlot(idx)}
                      />
                    ) : null}
                  </HStack>
                ))}
                <Button
                  variant="outline"
                  colorScheme="teal"
                  size="sm"
                  mt={1}
                  onPress={addPlayerSlot}
                >
                  + ADD PLAYER
                </Button>
              </VStack>
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={clearFilters} isDisabled={!hasActiveFilters}>
                CLEAR
              </Button>
              <Button colorScheme="teal" onPress={() => setFiltersOpen(false)}>
                DONE
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  )
}
