import React, { useContext, useEffect, useState } from 'react';
import { Text, Center, Box, Spinner, VStack, HStack, Button } from 'native-base';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { GamesContext } from '../context/GamesContext';
import { makeSummary, singlePlayerStats } from '../utils/stats';

export default function OverallStats() {
  const { games, players, gamePlayers, stats, gamesPlayed } = useContext(GamesContext);

  const [isLoading, setIsLoading] = useState(true);
  const [alternatingStats, setAlternatingStats] = useState<any[]>([]);
  const [showAllTime, setShowAllTime] = useState(true);
  const [summary, setSummary] = useState<any[] | null>(null)
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (games?.length && gamePlayers?.length && players?.length && stats?.length && gamesPlayed?.length) {
      setAlternatingStats(stats);
      setIsLoading(false);
      // const getSingles = singlePlayerStats(9, games);
      // setSingles(getSingles);
      const s = makeSummary(gamesPlayed, players)
      setSummary(s.sort((a, b) => b.ratio - a.ratio))
    }
  }, []);

  const abbreviateName = (player: string) => {
    const [name, ...lastName] = player.split(' ').filter(Boolean);
    return lastName.length && player.length >= 11 ? `${name} ${lastName[0][0]}.` : `${name} ${lastName}`;
  }

  return (
    <Box h="100%" backgroundColor="black">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.200" />
        </Center>
      ) : (
        <>
          <VStack>
            <Button
              flex={1}
              borderRadius="none"
              colorScheme="blueGray"
              variant={showSummary ? 'outline' : 'solid'}
              onPress={() => setShowSummary((state) => !state)}>
              SHOW SUMMARY
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
          <ScrollView>
            <HStack w="100%" mt={6} mb={2}>
              <Button
                flex={1}
                borderRadius="none"
                colorScheme="blueGray"
                variant={showAllTime ? 'subtle' : 'solid'}
                onPress={() => setShowAllTime((state) => !state)}
                w="50%"
              >
                ALL TIME
              </Button>
              <Button
                flex={1}
                borderRadius="none"
                colorScheme="blueGray"
                variant={showAllTime ? 'solid' : 'subtle'}
                onPress={() => setShowAllTime((state) => !state)}
                w="50%"
              >
                PER GAME
              </Button>
            </HStack>
            {alternatingStats.map((item: any, index: number) => {
              const type = showAllTime ? 'all time' : 'per game';
              if (item.type === type)
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
                                {subItem.stat.toFixed(2)}
                              </Text>
                            </HStack>
                          );
                        })}
                      </VStack>
                    ) : null}
                  </Box>
                );
            })}
          </ScrollView>
        </>
      )}
    </Box>
  );
}