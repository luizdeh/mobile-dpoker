import React, { useEffect, useState } from "react";
import {
  Text,
  Center,
  Box,
  Spinner,
  VStack,
  HStack,
  Button,
} from "native-base";
import { getAllGames } from "../utils/getAllGames";
import { getPlayers } from "../utils/fetchPlayers";
import { Game, GamePlayer, PlayerList } from "../lib/types";
import { getGamePlayers } from "../utils/getGamePlayers";
import { ScrollView } from "react-native";
import { IconButton } from "native-base";
import { Entypo } from "@expo/vector-icons";
import GameScoreboard from "../components/GameScoreboard";

export default function GamesPlayed() {
  const [isLoading, setIsLoading] = useState(true);

  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<PlayerList[]>([]);
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);

  const [initialFetch, setInitialFetch] = useState(false);

  const [stats, setStats] = useState<any[]>([]);

  const [showLegends, setShowLegends] = useState(false);

  useEffect(() => {
    (async () => {
      const fetchPlayers = await getPlayers();
      if (fetchPlayers) setPlayers(fetchPlayers);

      const fetchGames = await getAllGames();
      if (fetchGames)
        setGames(fetchGames.filter((game: Game) => game.status === "CLOSED"));

      const fetchGamePlayers = await getGamePlayers();
      if (fetchGamePlayers) setGamePlayers(fetchGamePlayers);

      if (fetchGames.length && fetchPlayers.length && fetchGamePlayers.length)
        setInitialFetch(true);
    })();
  }, []);

  useEffect(() => {
    if (initialFetch) {
      const gamesPlayed = games.map((game: Game) => {
        const game_played = gamePlayers.filter(
          (item: GamePlayer) => item.game_id === game.id
        );
        let sum_of_chips = 0;
        game_played.length >= 1
          ? (sum_of_chips = game_played.reduce((a, b) => a + b.chips, 0))
          : 0;
        const active_players = game_played.map((player: GamePlayer) => {
          const equity = player.chips / sum_of_chips || 0;
          const investment =
            (game.buy_in_value + player.quantity_rebuy * game.re_buy_value) *
            game.chip_value;
          const name = players.find(
            (playerName: PlayerList) => playerName.id === player.person_id
          )?.name;
          const prize = player.chips * game.chip_value;
          const profit = prize - investment;
          return { ...player, equity, investment, name, prize, profit };
        });
        return { ...game, active_players, sum_of_chips };
      });
      setStats(gamesPlayed);
    }
  }, [initialFetch]);

  useEffect(() => {
    if (stats.length) setIsLoading(false);
  }, [stats]);

  return (
    <Box h="100%" px="4" py="2" backgroundColor="white">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.600" />
        </Center>
      ) : (
        <>
          <Center py={1}>
            <HStack alignItems="center">
              <Text>Legend</Text>
              <IconButton
                _icon={
                  showLegends
                    ? {
                      as: Entypo,
                      name: "chevron-up",
                      color: "blueGray.600",
                      size: "lg",
                    }
                    : {
                      as: Entypo,
                      name: "chevron-down",
                      color: "blueGray.600",
                      size: "lg",
                    }
                }
                onPress={() => setShowLegends((state) => !state)}
              />
            </HStack>
            {showLegends ? (
              <VStack
                space={1}
                w="40%"
                borderWidth="1"
                borderRadius="lg"
                borderColor="emerald.600"
                p={1}
              >
                <HStack
                  alignItems="baseline"
                  borderBottomWidth="1"
                  borderBottomColor="emerald.600"
                >
                  <Text flex={1} bold textAlign="center">
                    R
                  </Text>
                  <Text flex={1}>Rebuy</Text>
                </HStack>
                <HStack
                  alignItems="baseline"
                  borderBottomWidth="1"
                  borderBottomColor="emerald.600"
                >
                  <Text flex={1} bold textAlign="center">
                    I
                  </Text>
                  <Text flex={1}>Investment</Text>
                </HStack>
                <HStack
                  alignItems="baseline"
                  borderBottomWidth="1"
                  borderBottomColor="emerald.600"
                >
                  <Text flex={1} bold textAlign="center">
                    P
                  </Text>
                  <Text flex={1}>Prize</Text>
                </HStack>
                <HStack
                  alignItems="baseline"
                  borderBottomWidth="1"
                  borderBottomColor="emerald.600"
                >
                  <Text flex={1} bold textAlign="center">
                    $
                  </Text>
                  <Text flex={1}>Profit</Text>
                </HStack>
                <HStack alignItems="baseline">
                  <Text flex={1} bold textAlign="center">
                    %
                  </Text>
                  <Text flex={1}>Equity</Text>
                </HStack>
              </VStack>
            ) : null}
          </Center>
          <ScrollView>
            {stats.map((game: any, index: number) => {
              return <GameScoreboard key={index} game={game} index={index} />;
            })}
          </ScrollView>
        </>
      )}
    </Box>
  );
}
