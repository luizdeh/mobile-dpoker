import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Text, Center, Box, Spinner, VStack, HStack, Button } from 'native-base';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { GamesContext } from '../context/GamesContext';
import { makeSummary, singlePlayerStats } from '../utils/stats';
import { Game, Stats } from '../lib/types';
import { makeOverallStats } from '../utils/stats';

// Ranking panel is disabled for now (kept for a possible future re-enable).
const RANKING_ENABLED = false;

const STAT_CATEGORIES = ['Single-Game Records', 'All-Time Totals', 'Streaks', 'Per-Game Averages'];
const CATEGORY_LABELS: Record<string, string> = {
  'Single-Game Records': 'RECORDS',
  'All-Time Totals': 'TOTALS',
  Streaks: 'STREAKS',
  'Per-Game Averages': 'AVERAGES',
};

export default function OverallStats() {
  const { games, players, gamePlayers, stats, gamesPlayed } = useContext(GamesContext);

  const [isLoading, setIsLoading] = useState(true);
  const [alternatingStats, setAlternatingStats] = useState<Stats[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(STAT_CATEGORIES[0]);
  const [summary, setSummary] = useState<any[] | null>(null)
  const [showSummary, setShowSummary] = useState(false);
  const [topTen, setTopTen] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<string | null>(null);
  const [seasonInitialized, setSeasonInitialized] = useState(false);

  const currentYear = String(new Date().getFullYear());
  const isCurrentSeason = seasons === null || seasons === currentYear;

  const years = useMemo(
    () => Array.from(new Set((games ?? []).map((game: Game) => game.date.slice(0, 4)))).sort().reverse(),
    [games]
  );

  const seasonSummary = useMemo(() => {
    const filteredGames = seasons
      ? (games ?? []).filter((game: Game) => game.date.slice(0, 4) === seasons)
      : (games ?? []);
    const gameIds = new Set(filteredGames.map((game: Game) => game.id));
    const playerIds = new Set(
      (gamePlayers ?? [])
        .filter((gp: any) => gameIds.has(gp.game_id))
        .map((gp: any) => gp.person_id)
    );
    return { games: filteredGames.length, players: playerIds.size };
  }, [games, gamePlayers, seasons]);

  useEffect(() => {
    if (games?.length && gamePlayers?.length && players?.length && stats?.length && gamesPlayed?.length) {
      setAlternatingStats(stats);
      setIsLoading(false);
      // const getSingles = singlePlayerStats(9, games);
      // setSingles(getSingles);

      const s = makeSummary(gamesPlayed, players)
      setSummary(s.sort((a, b) => b.ratio - a.ratio))

      // const top = stats.map((item: Stats) => {
      //   const statszera = item.name === 'top prizes in a game' || item.name === 'largest equities in a game' ? item.stats.splice(0, 10) : item.stats
      //   return {
      //     ...item,
      //     stats: statszera
      //   }
      // })
      //
      // setTopTen(top)


      // console.log('games', games)
      // console.log('players', players)
      // console.log('gamePlayers', gamePlayers)
      // console.log('stats', stats)
      // console.log('gamesPlayed', gamesPlayed)
    }
  }, []);

  useEffect(() => {
    if (!seasonInitialized && games?.length) {
      const hasCurrentYearGames = games.some((game: Game) => game.date.slice(0, 4) === currentYear);
      if (hasCurrentYearGames) setSeasons(currentYear);
      setSeasonInitialized(true);
    }
  }, [seasonInitialized, games]);

  useEffect(() => {
    if (games?.length && gamePlayers?.length && players?.length && stats?.length && gamesPlayed?.length) {
      const filteredGames = seasons
        ? games.filter((item: Game) => item.date.slice(0, 4) === seasons)
        : games
      const newStats = makeOverallStats(filteredGames, gamePlayers, players)
      const newNewStats = newStats.map((item: Stats) => ({
        ...item,
        stats: item.limit ? item.stats.splice(0, item.limit) : item.stats,
      }))
      setAlternatingStats(newNewStats)
    }
  }, [seasons, games, gamePlayers, players, stats, gamesPlayed]);

  // useEffect(() => {
  //   if (alternatingStats?.length) {
  //     const top = alternatingStats.map((item: Stats, index: number) => {
  //       // const statszera = item.name === 'top prizes in a game' || item.name === 'largest equities in a game'
  //       const statszera = index === 0 || index === 1
  //       return {
  //         ...item,
  //         stats: statszera ? item.stats.splice(0, 10) : item.stats
  //       }
  //     })
  //     setTopTen(top)
  //     console.log({ top })
  //     console.log({ alternatingStats })
  //   }
  // }, [alternatingStats]);


  const abbreviateName = (player: string) => {
    const [name, ...lastName] = player.split(' ').filter(Boolean);
    return lastName.length && player.length >= 11 ? `${name} ${lastName[0][0]}.` : `${name} ${lastName}`;
  }

  // {topTen.length && (item.name === 'top prizes in a game' || item.name === 'largest equities in a game')
  //   ? topTen.map((subItem: any, idx: number) => {
  //     return (
  //       <HStack
  //         key={idx}
  //         w="100%"
  //         alignItems="center"
  //         h="10"
  //         backgroundColor={idx % 2 === 0 ? 'white' : 'teal.50'}
  //         px="2"
  //       >
  //         <Text flex={3} fontSize="xs">
  //           {idx + 1}. {subItem.name.toUpperCase()}
  //         </Text>
  //         <Text flex={1} fontSize="xs" textAlign="center" color="coolGray.400">
  //           GP: {subItem.games}
  //         </Text>
  //         <Text flex={1} textAlign="right" fontSize="xs">
  //           {subItem.stat.toFixed(2)}
  //         </Text>
  //       </HStack>
  //     );
  //   })
  //
  return (
    <Box h="100%" backgroundColor="black">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.200" />
        </Center>
      ) : (
        <ScrollView>
          {RANKING_ENABLED ? (
            <VStack>
              <Button
                flex={0}
                borderRadius="none"
                colorScheme="muted"
                variant={showSummary ? 'outline' : 'solid'}
                onPress={() => setShowSummary((state) => !state)}>
                TOGGLE RANKING
              </Button>
              {showSummary ?
                <VStack>
                  <HStack backgroundColor='teal.600' py={2}>
                    <Text flex={1.5} fontSize='xs' ml={1}>PLAYER</Text>
                    <Text flex={1} textAlign='right' fontSize='xs'>GP</Text>
                    <Text flex={1} textAlign='right' fontSize='xs'>R</Text>
                    <Text flex={1} textAlign='right' fontSize='xs'>Pos</Text>
                    <Text flex={1} textAlign='right' fontSize='xs'>Rat</Text>
                    <Text flex={1} textAlign='right' fontSize='xs' mr={1}>Eq</Text>
                  </HStack>
                  {summary?.map((item: any, idx: number) => {
                    return (
                      <HStack key={idx} backgroundColor={idx % 2 === 0 ? 'white' : 'teal.50'} py={2}>
                        <Text flex={1.5} fontSize='xs' ml={1}>{abbreviateName(item.name).toUpperCase()}</Text>
                        <Text flex={1} textAlign='right' fontSize='xs'>{item.games}</Text>
                        <Text flex={1} textAlign='right' fontSize='xs'>{item.rebuys}</Text>
                        <Text flex={1} textAlign='right' fontSize='xs'>{item.positive}</Text>
                        <Text flex={1} textAlign='right' fontSize='xs'>{item.ratio}</Text>
                        <Text flex={1} textAlign='right' fontSize='xs' mr={1}>{item.equity}</Text>
                      </HStack>
                    )
                  })}
                </VStack>
                : null}
            </VStack>
          ) : null}
          <VStack space={1} px={3} pt={4}>
            <Text fontSize="10" color="blueGray.400" ml={1}>SEASON</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space={1}>
                <Button
                  minW="24"
                  px={3}
                  size="sm"
                  borderRadius="none"
                  colorScheme="blueGray"
                  variant={seasons === null ? 'subtle' : 'solid'}
                  onPress={() => setSeasons(null)}
                >
                  ALL SEASONS
                </Button>
                {years.map((year: string) => (
                  <Button
                    key={year}
                    minW="16"
                    px={3}
                    size="sm"
                    borderRadius="none"
                    colorScheme="blueGray"
                    variant={seasons === year ? 'subtle' : 'solid'}
                    onPress={() => setSeasons(year)}
                  >
                    {year}
                  </Button>
                ))}
              </HStack>
            </ScrollView>
            <Text fontSize="xs" color="blueGray.400" mt={1} ml={1}>
              {(seasons ?? 'ALL SEASONS').toUpperCase()} · {seasonSummary.games} GAMES · {seasonSummary.players} PLAYERS
            </Text>
          </VStack>
          <VStack space={1} px={3} pt={6} pb={2}>
            <Text fontSize="10" color="blueGray.400" ml={1}>CATEGORY</Text>
            <HStack space={1}>
              {STAT_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  flex={1}
                  size="sm"
                  borderRadius="none"
                  colorScheme="blueGray"
                  variant={activeCategory === category ? 'subtle' : 'solid'}
                  onPress={() => setActiveCategory(category)}
                >
                  {CATEGORY_LABELS[category]}
                </Button>
              ))}
            </HStack>
          </VStack>
          {alternatingStats.map((item: any, index: number) => {
              if (item.category === activeCategory && (!item.currentOnly || isCurrentSeason))
                return (
                  <Box alignItems="center" key={index}>
                    <Button
                      p="2"
                      colorScheme={item.show ? 'teal' : 'blueGray'}
                      variant="solid"
                      textAlign="center"
                      w="95%"
                      mt="4"
                      borderRadius="none"
                      onPress={() =>
                        setAlternatingStats((prev: any) => {
                          const temp = [...prev];
                          temp[index].show = !temp[index].show;
                          return temp;
                        })
                      }
                    >
                      {item.name.toUpperCase()}
                    </Button>
                    {item.show ? (
                      <VStack w="95%" space={0}>
                        {item.stats.map((subItem: any, idx: number) => {
                          return (
                            <HStack
                              key={idx}
                              w="100%"
                              alignItems="center"
                              h="10"
                              backgroundColor={idx % 2 === 0 ? 'white' : 'teal.50'}
                              px="2"
                            >
                              <Text flex={3} fontSize="xs">
                                {idx + 1}. {subItem.name.toUpperCase()}
                              </Text>
                              <Text flex={1} fontSize="xs" textAlign="center" color="coolGray.400">
                                GP: {subItem.games}
                              </Text>
                              <Text flex={1} textAlign="right" fontSize="xs">
                                {subItem.stat.toFixed(item.decimals ?? 2)}
                              </Text>
                              {subItem.secondaryStat !== undefined ? (
                                <Text flex={1.5} textAlign="right" fontSize="xs" color="coolGray.400">
                                  {subItem.secondaryStat.toFixed(2)}
                                </Text>
                              ) : null}
                            </HStack>
                          );
                        })}
                      </VStack>
                    ) : null}
                  </Box>
                );
            })}
        </ScrollView>
      )}
    </Box>
  );
}