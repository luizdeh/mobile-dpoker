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

export default function OverallStats() {
  const [isLoading, setIsLoading] = useState(true);

  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<PlayerList[]>([]);
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);

  const [initialFetch, setInitialFetch] = useState(false);

  const [stats, setStats] = useState<any[]>([]);

  const [showAllTime, setShowAllTime] = useState(true);

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
      const obj = games.map((game: Game) => {
        const game_played = gamePlayers.filter(
          (item: GamePlayer) => item.game_id === game.id
        );
        let sum_of_chips = 0;
        game_played.length >= 1
          ? (sum_of_chips = game_played.reduce((a, b) => a + b.chips, 0))
          : 0;
        return { ...game, game_played, sum_of_chips };
      });

      const allGames = gamePlayers.map((item: any) => {
        const name = players.find(
          (playerName: PlayerList) => playerName.id === item.person_id
        )?.name;
        const idx = obj.findIndex((idx: any) => idx.id === item.game_id);
        const copyObj = [...obj];
        const foundGame = copyObj[idx];
        const { buy_in_value, re_buy_value, chip_value, sum_of_chips } =
          foundGame;
        const equity = item.chips / sum_of_chips;
        const investment =
          (buy_in_value + item.quantity_rebuy * re_buy_value) * chip_value;
        const prize = item.chips * chip_value;
        return { ...item, equity, investment, prize, name };
      });

      // console.log(allGames);

      const playerTotals = players.map((item: PlayerList) => {
        const myGames = allGames.filter(
          (player: GamePlayer) => player.person_id === item.id
        );
        const rebuys = myGames.reduce((a, b) => a + b.quantity_rebuy, 0);
        const investments = myGames.reduce((a, b) => a + b.investment, 0);
        const prize = myGames.reduce((a, b) => a + b.prize, 0);
        const profit = prize - investments;
        const equitySum = myGames.reduce((a, b) => a + b.equity, 0);
        const average_equity = equitySum / myGames.length || 0;
        const perGame = (stat: number) => stat / myGames.length || 0;
        return {
          id: item.id,
          name: item.name,
          games_played: myGames.length,
          investments: investments,
          investments_per_game: perGame(investments),
          prize,
          prize_per_game: perGame(prize),
          profit,
          profit_per_game: perGame(profit),
          rebuys,
          rebuys_per_game: perGame(rebuys),
          average_equity,
        };
      });

      // console.log(playerTotals);

      const makeTopFive = (what: any) => {
        const temp = [...allGames];
        return temp
          .map((item: any) => {
            const top = item[what];
            const statName =
              what === "prize" ? "top prizes" : "largest equities";
            const games = playerTotals.find(
              (player: any) => player.id === item.person_id
            )?.games_played;
            return {
              person_id: item.person_id,
              name: item.name,
              stat: top,
              statName,
              games,
            };
          })
          .sort((a, b) => b.stat - a.stat)
          .splice(0, 5);
      };

      const makeStats = (what: string, order: string) => {
        return playerTotals
          .map((item: any) => {
            const stat = item[what];
            return {
              name: item.name,
              stat: stat,
              games: item.games_played,
              statName: what,
              person_id: item.id,
            };
          })
          .sort((a, b) => (order == "down" ? b.stat - a.stat : a.stat - b.stat))
          .filter((item: any) => item.games > 1);
      };

      setStats([
        {
          name: "top prizes in a game",
          stats: makeTopFive("prize"),
          type: "all time",
          show: false,
        },
        {
          name: "largest equities in a game",
          stats: makeTopFive("equity"),
          type: "all time",
          show: false,
        },
        {
          name: "all-time prizes",
          stats: makeStats("prize", "down"),
          type: "all time",
          show: false,
        },
        {
          name: "all-time investments",
          stats: makeStats("investments", "up"),
          type: "all time",
          show: false,
        },
        {
          name: "all-time profits",
          stats: makeStats("profit", "down"),
          type: "all time",
          show: false,
        },
        {
          name: "all-time rebuys",
          stats: makeStats("rebuys", "up"),
          type: "all time",
          show: false,
        },
        {
          name: "average equity",
          stats: makeStats("average_equity", "down"),
          type: "per game",
          show: false,
        },
        {
          name: "profit per game",
          stats: makeStats("profit_per_game", "down"),
          type: "per game",
          show: false,
        },
        {
          name: "prize per game",
          stats: makeStats("prize_per_game", "down"),
          type: "per game",
          show: false,
        },
        {
          name: "investment per game",
          stats: makeStats("investments_per_game", "up"),
          type: "per game",
          show: false,
        },
        {
          name: "rebuys per game",
          stats: makeStats("rebuys_per_game", "up"),
          type: "per game",
          show: false,
        },
      ]);
    }
  }, [initialFetch]);

  useEffect(() => {
    if (stats.length === 11) setIsLoading(false);
  }, [stats]);

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
              variant={showAllTime ? "subtle" : "solid"}
              onPress={() => setShowAllTime((state) => !state)}
              w="50%"
            >
              ALL TIME
            </Button>
            <Button
              flex={1}
              borderRadius="none"
              colorScheme="blueGray"
              variant={showAllTime ? "solid" : "subtle"}
              onPress={() => setShowAllTime((state) => !state)}
              w="50%"
            >
              PER GAME
            </Button>
          </HStack>
          {stats.map((item: any, index: number) => {
            const type = showAllTime ? "all time" : "per game";
            if (item.type === type)
              return (
                <Box alignItems="center" key={index}>
                  <Button
                    p="2"
                    colorScheme={item.show ? "teal" : "blueGray"}
                    variant="solid"
                    textAlign="center"
                    w="95%"
                    mt="4"
                    borderRadius="none"
                    onPress={() =>
                      setStats((prev: any) => {
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
                            backgroundColor={
                              idx % 2 === 0 ? "white" : "teal.50"
                            }
                            px="2"
                          >
                            <Text flex={3} fontSize="xs">
                              {idx + 1}. {subItem.name.toUpperCase()}
                            </Text>
                            <Text
                              flex={1}
                              fontSize="xs"
                              textAlign="center"
                              color="coolGray.400"
                            >
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
