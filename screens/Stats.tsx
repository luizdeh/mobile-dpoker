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
        return allGames
          .map((item: any) => {
            const topFive = item[what];
            const statName =
              what === "prize" ? "top prizes" : "largest equities";
            return {
              name: item.name,
              stat: topFive,
              statName,
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
            };
          })
          .sort((a, b) => (order == "down" ? b.stat - a.stat : a.stat - b.stat))
          .filter((item: any) => item.games !== 0);
      };

      setStats([
        {
          name: "top prizes in a game",
          stats: makeTopFive("prize"),
          show: false,
        },
        {
          name: "largest equities in a game",
          stats: makeTopFive("equity"),
          show: false,
        },
        {
          name: "average equity",
          stats: makeStats("average_equity", "down"),
          show: false,
        },
        {
          name: "all-time prizes",
          stats: makeStats("prize", "down"),
          show: false,
        },
        {
          name: "all-time investments",
          stats: makeStats("investments", "up"),
          show: false,
        },
        {
          name: "all-time profits",
          stats: makeStats("profit", "down"),
          show: false,
        },
        {
          name: "all-time rebuys",
          stats: makeStats("rebuys", "up"),
          show: false,
        },
      ]);
    }
  }, [initialFetch]);

  useEffect(() => {
    if (stats.length === 7) setIsLoading(false);
    // console.log(stats);
  }, [stats]);

  return (
    <Box h="100%" px="4" py="2" backgroundColor="white">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.600" />
        </Center>
      ) : (
        <ScrollView>
          <VStack space={2} my="2">
            <HStack justifyContent="space-evenly">
              <Text textAlign="left">GAMES PLAYED</Text>
              <Text textAlign="right">{games.length}</Text>
            </HStack>
          </VStack>
          {stats.map((item: any, index: number) => {
            return (
              <Box alignItems="center" key={index}>
                <Button
                  p="2"
                  colorScheme="blueGray"
                  variant={item.show ? "solid" : "subtle"}
                  textAlign="center"
                  w="95%"
                  mt="2"
                  borderColor="blueGray.300"
                  borderRadius="none"
                  borderWidth="1"
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
                  <VStack
                    w="95%"
                    space={1}
                    borderColor="blueGray.300"
                    borderRadius="none"
                    borderWidth="1"
                  >
                    {item.stats.map((subItem: any, idx: number) => {
                      return (
                        <HStack
                          key={idx}
                          w="100%"
                          alignItems="center"
                          h="12"
                          backgroundColor="tertiary.50"
                          px="2"
                        >
                          <Text flex={1}>
                            {idx + 1}. {subItem.name.toUpperCase()}
                          </Text>
                          <Text textAlign="right">
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
