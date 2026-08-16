import React, { useState } from "react";
import { Box, Button, Center, HStack, Text, VStack } from "native-base";
import { ScrollView } from "react-native";
import useTournamentsContext from "../context/useTournamentsContext";

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

const STAT_CATEGORIES = ["Tournament Records", "All-Time Totals", "Per-Tournament Averages"];
const CATEGORY_LABELS: Record<string, string> = {
  "Tournament Records": "RECORDS",
  "All-Time Totals": "TOTALS",
  "Per-Tournament Averages": "AVERAGES",
};

export default function TournamentStatistics() {
  const { tournamentStats } = useTournamentsContext();

  const [activeCategory, setActiveCategory] = useState<string>(STAT_CATEGORIES[0]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <Box h="100%" backgroundColor="black" px={4} py={4}>
      {!tournamentStats?.length ? (
        <Center flex={1}>
          <Text color="blueGray.500">Not enough data yet.</Text>
        </Center>
      ) : (
        <ScrollView>
          <VStack space={1} pb={2}>
            <HStack space={1}>
              {STAT_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  flex={1}
                  size="sm"
                  borderRadius="none"
                  colorScheme="blueGray"
                  variant={activeCategory === category ? "subtle" : "solid"}
                  onPress={() => setActiveCategory(category)}
                >
                  {CATEGORY_LABELS[category]}
                </Button>
              ))}
            </HStack>
          </VStack>
          {tournamentStats
            .filter((item: any) => item.category === activeCategory)
            .map((item: any) => (
              <Box alignItems="center" key={item.name}>
                <Button
                  p="2"
                  colorScheme={expanded[item.name] ? "teal" : "blueGray"}
                  variant="solid"
                  textAlign="center"
                  w="100%"
                  mt="3"
                  borderRadius="none"
                  onPress={() => setExpanded((prev) => ({ ...prev, [item.name]: !prev[item.name] }))}
                >
                  {item.name.toUpperCase()}
                </Button>
                {expanded[item.name] ? (
                  <VStack w="100%" space={0}>
                    {item.stats.map((subItem: any, idx: number) => (
                      <HStack
                        key={idx}
                        w="100%"
                        alignItems="center"
                        h="10"
                        backgroundColor={idx % 2 === 0 ? "white" : "teal.50"}
                        px="2"
                      >
                        <Text flex={3} fontSize="xs">
                          {idx + 1}. {subItem.name.toUpperCase()}
                        </Text>
                        <Text flex={1} fontSize="xs" textAlign="center" color="coolGray.400">
                          T: {subItem.games}
                        </Text>
                        <Text flex={1} textAlign="right" fontSize="xs">
                          {item.name === "ITM percentage" ? formatPercent(subItem.stat) : subItem.stat.toFixed(item.decimals ?? 2)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                ) : null}
              </Box>
            ))}
        </ScrollView>
      )}
    </Box>
  );
}
