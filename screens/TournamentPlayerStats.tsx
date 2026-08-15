import React, { useMemo, useState } from "react";
import { Box, Button, Center, HStack, Select, Text, VStack } from "native-base";
import { ScrollView } from "react-native";
import useTournamentsContext from "../context/useTournamentsContext";
import useGamesContext from "../context/useGamesContext";
import { makePlayerTournamentCard } from "../utils/tournamentStats";
import { PlayerList } from "../lib/types";

const formatMoney = (value: number) => value.toFixed(2);
const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

function StatTile({ label, value, color = "white" }: { label: string; value: string; color?: string }) {
  return (
    <Box>
      <Text color="blueGray.400" fontSize="11">{label}</Text>
      <Text color={color} fontSize="sm" bold>{value}</Text>
    </Box>
  );
}

export default function TournamentPlayerStats() {
  const { players } = useGamesContext();
  const { tournaments, tournamentPlayers } = useTournamentsContext();

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const sortedPlayers = useMemo(
    () => [...(players ?? [])].sort((a: PlayerList, b: PlayerList) => a.name.localeCompare(b.name)),
    [players]
  );

  const card = useMemo(() => {
    if (!selectedPlayerId || !tournaments?.length || !tournamentPlayers?.length || !players?.length) return null;
    return makePlayerTournamentCard(selectedPlayerId, tournaments, tournamentPlayers, players);
  }, [selectedPlayerId, tournaments, tournamentPlayers, players]);

  return (
    <Box h="100%" backgroundColor="black" px={4} py={4}>
      <VStack space={1} mb={4}>
        <Text fontSize="10" color="blueGray.400" ml={1}>PLAYER</Text>
        <HStack space={2} alignItems="center">
          <Box flex={1}>
            <Select
              color="white"
              placeholderTextColor="blueGray.400"
              selectedValue={selectedPlayerId !== null ? String(selectedPlayerId) : ""}
              placeholder="SELECT A PLAYER"
              onValueChange={(value) => setSelectedPlayerId(value ? Number(value) : null)}
            >
              {sortedPlayers.map((player: PlayerList) => (
                <Select.Item key={player.id} label={player.name.toUpperCase()} value={String(player.id)} />
              ))}
            </Select>
          </Box>
          {selectedPlayerId !== null ? (
            <Button size="sm" variant="ghost" colorScheme="blueGray" onPress={() => setSelectedPlayerId(null)}>
              CLEAR
            </Button>
          ) : null}
        </HStack>
      </VStack>

      {!card ? (
        <Center flex={1}>
          <Text color="blueGray.500" fontSize="xs">
            Select a player to view their tournament stats.
          </Text>
        </Center>
      ) : (
        <ScrollView>
          <VStack space={6} flex={1}>
            <Text color="white" fontSize="lg" bold textAlign="center">
              {card.name.toUpperCase()}
            </Text>
            <HStack space={4}>
              <VStack flex={1} space={4}>
                <StatTile label="TOURNAMENTS PLAYED" value={String(card.tournaments_played)} />
                <StatTile label="ITM FINISHES" value={String(card.itm_count)} />
                <StatTile label="TOTAL POINTS" value={String(card.total_points)} />
                <StatTile label="TOTAL PRIZE MONEY" value={formatMoney(card.total_prize)} color="teal.300" />
              </VStack>
              <VStack flex={1} space={4}>
                <StatTile label="WINS" value={String(card.wins)} color={card.wins > 0 ? "teal.300" : "white"} />
                <StatTile label="ITM %" value={formatPercent(card.itm_percentage)} />
                <StatTile label="AVG POINTS" value={formatMoney(card.average_points)} />
                <StatTile
                  label="NET EARNINGS"
                  value={formatMoney(card.net_earnings)}
                  color={card.net_earnings > 0 ? "teal.300" : card.net_earnings < 0 ? "rose.400" : "white"}
                />
              </VStack>
            </HStack>
          </VStack>
        </ScrollView>
      )}
    </Box>
  );
}
