import React, { useState } from "react";
import { Box, VStack, HStack, Text, Pressable, Icon, ScrollView, Center } from "native-base";
import { AntDesign } from "@expo/vector-icons";
import useTournamentsContext from "../context/useTournamentsContext";

const ordinal = (n: number) => {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}TH`;
  switch (n % 10) {
    case 1: return `${n}ST`;
    case 2: return `${n}ND`;
    case 3: return `${n}RD`;
    default: return `${n}TH`;
  }
};

const formatMoney = (value: number) => (Math.round((value + Number.EPSILON) * 100) / 100).toString();

export default function TournamentsPlayed() {
  const { tournamentsPlayed } = useTournamentsContext();

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const tournaments = tournamentsPlayed ?? [];

  return (
    <Box h="100%" backgroundColor="black" px={2} py={2}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={2} px={2} py={2}>
          {tournaments.map((tournament: any) => {
            const isExpanded = expandedId === tournament.id;
            const date = new Date(tournament.date).toLocaleDateString("pt-BR");
            return (
              <VStack key={tournament.id} backgroundColor="blueGray.800" borderRadius="sm" overflow="hidden">
                <Pressable onPress={() => setExpandedId((prev) => (prev === tournament.id ? null : tournament.id))}>
                  <HStack justifyContent="space-between" alignItems="center" px={3} py={3}>
                    <VStack>
                      <Text color="white" fontSize="sm" bold>
                        {date}
                      </Text>
                      <Text color="blueGray.400" fontSize="10">
                        {tournament.entrant_count} ENTRANTS
                      </Text>
                    </VStack>
                    <VStack alignItems="flex-end">
                      <Text color="teal.300" fontSize="sm" bold isTruncated maxWidth="150">
                        {(tournament.champion?.name ?? "—").toUpperCase()}
                      </Text>
                      <Text color="blueGray.500" fontSize="10">
                        CHAMPION
                      </Text>
                    </VStack>
                  </HStack>
                </Pressable>
                {isExpanded ? (
                  <VStack pb={3} pt={1} borderTopWidth={1} borderColor="blueGray.700">
                    <HStack px={3} py={1} space={2}>
                      <Text flex={2} fontSize="10" color="blueGray.500" bold>
                        PLAYER
                      </Text>
                      <Text flex={1} fontSize="10" color="blueGray.500" bold textAlign="center">
                        PTS
                      </Text>
                      <Text flex={1} fontSize="10" color="blueGray.500" bold textAlign="right">
                        NET
                      </Text>
                    </HStack>
                    {tournament.entries.map((entry: any, index: number) => (
                      <HStack
                        key={entry.id}
                        alignItems="center"
                        px={3}
                        py={1}
                        space={2}
                        backgroundColor={index % 2 === 0 ? "blueGray.900" : "transparent"}
                      >
                        <VStack flex={2}>
                          <Text color="white" fontSize="sm" isTruncated>
                            {(entry.name ?? "").toUpperCase()}
                          </Text>
                          <HStack space={1} alignItems="center">
                            <Text color="blueGray.500" fontSize="10">
                              {entry.finish_position ? ordinal(entry.finish_position) : "—"}
                            </Text>
                            {entry.is_split ? (
                              <Icon as={AntDesign} name="team" size="2xs" color="blueGray.500" />
                            ) : null}
                          </HStack>
                        </VStack>
                        <Text flex={1} color="blueGray.300" fontSize="sm" textAlign="center">
                          {entry.points}
                        </Text>
                        <Text
                          flex={1}
                          color={entry.profit >= 0 ? "teal.300" : "rose.400"}
                          fontSize="sm"
                          bold
                          textAlign="right"
                        >
                          {formatMoney(entry.profit)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                ) : null}
              </VStack>
            );
          })}
          {!tournaments.length ? (
            <Center py={8}>
              <Text color="blueGray.400" fontSize="xs">
                No tournaments played yet.
              </Text>
            </Center>
          ) : null}
        </VStack>
      </ScrollView>
    </Box>
  );
}
