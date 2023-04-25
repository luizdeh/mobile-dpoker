import React, { useState, useEffect } from "react";
import { Text, HStack, Box, VStack, Divider, IconButton } from "native-base";
import { useRoute } from "@react-navigation/native";
import { getGamePlayers } from "../utils/getGamePlayers";
import { gameStatus } from "../utils/gameStatus";
import ActivePlayer from "../components/ActivePlayer";
import { Player } from "../utils/types";

// TODO:
// interact with database with confirmations

// TODO:
// closing the game
// 1. create the function to update chips for each player
// 2. create the function to close the game in the db
// 3. render the button
// 4. create the modal to update chips for each player

// TODO:
// adding a player
// 1. check if the function to add a player to a game works with the ACTIVE status
// 2. render the button -> modal with list of inactive players
// 3. render updated game
// 4. check if rebuys are working

export default function ActiveGame() {
  const route = useRoute();

  const game = route?.params?.game;
  const players = route?.params?.players;

  // console.log(route);

  const [activePlayers, setActivePlayers] = useState([]);

  // useEffect(() => {
  //   console.log(activePlayers);
  // }, [activePlayers]);

  useEffect(() => {
    (async () => {
      await gameStatus(game.id, "ACTIVE");

      const gamePlayers = await getGamePlayers();
      if (gamePlayers) {
        const currentGamePlayers = gamePlayers.filter(
          (item: any) => item.game_id === game.id
        );
        const gamePlayersWithNames = currentGamePlayers.map((item: any) => {
          const buy_in_value = game.buy_in_value;
          const re_buy_value = game.re_buy_value;
          const name = players.find(
            (player: any) => player.id === item.person_id
          ).name;
          return { ...item, name, buy_in_value, re_buy_value };
        });
        setActivePlayers(gamePlayersWithNames);
      }
    })();
  }, []);

  const totalChips = () => {
    if (activePlayers.length === 0) return 0;
    const buyins = activePlayers.length * game.buy_in_value;
    const rebuys =
      activePlayers.reduce((a, b) => a + b.quantity_rebuy, 0) *
      game.buy_in_value;
    return buyins + rebuys;
  };

  const averageStack = () => Math.round(totalChips() / activePlayers.length);

  return (
    <Box
      _dark={{ bg: "blueGray.900" }}
      _light={{ bg: "blueGray.50" }}
      h="100%"
      p={8}
    >
      <VStack>
        <HStack space={6} justifyItems="space-between" alignItems="center">
          <Text flex={3} fontWeight="bold">
            PLAYER
          </Text>
          <Text flex={2} fontWeight="bold" textAlign="center">
            RE-BUYS
          </Text>
          <Text flex={1} fontWeight="bold" textAlign="center">
            CHIPS
          </Text>
        </HStack>
        <Divider
          my="2"
          _light={{
            bg: "muted.800",
          }}
          _dark={{
            bg: "muted.50",
          }}
        />
        {activePlayers
          ? activePlayers.map((player: Player) => (
            <ActivePlayer
              key={player.id}
              player={player}
              updateActivePlayers={setActivePlayers}
            />
          ))
          : null}
      </VStack>
      <br />
      <br />
      <VStack space={4}>
        <HStack space={8} justifyItems="space-between" alignItems="center">
          <Text flex={4} fontSize="xl">
            TOTAL CHIPS
          </Text>
          <Text flex={1} fontSize="xl" textAlign="right">
            {totalChips()}
          </Text>
        </HStack>
        <HStack space={8} justifyItems="space-between" alignItems="center">
          <Text flex={4} fontSize="sm">
            AVERAGE STACK
          </Text>
          <Text flex={1} fontSize="sm" textAlign="right">
            {averageStack()}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
