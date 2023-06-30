import React, { useContext, useEffect, useState } from 'react';
import { Text, Center, Box, Spinner, VStack, HStack, Button } from 'native-base';
import { ScrollView } from 'react-native';
import { GamesContext } from '../context/GamesContext';

export default function OverallStats() {
  const { games, players, gamePlayers, stats } = useContext(GamesContext);

  const [isLoading, setIsLoading] = useState(true);
  const [alternatingStats, setAlternatingStats] = useState<any[]>([]);
  const [showAllTime, setShowAllTime] = useState(true);

  useEffect(() => {
    if (games?.length && gamePlayers?.length && players?.length) {
      setAlternatingStats(stats);
      setIsLoading(false);
    }
  }, []);

  return (
    <Box h="100%" backgroundColor="black">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.200" />
        </Center>
      ) : (
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
      )}
    </Box>
  );
}
