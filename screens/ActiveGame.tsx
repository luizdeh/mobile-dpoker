import React, { useState, useEffect } from "react";
import { Text, HStack, Box, VStack, Divider, IconButton } from "native-base";
import { useRoute } from "@react-navigation/native";
import { getGamePlayers } from "../utils/getGamePlayers";
import { addRebuy } from "../utils/addRebuy";
import { gameStatus } from "../utils/gameStatus";
import { Entypo } from "@expo/vector-icons";

// TODO:
// create a single object to manage everything through state
// interact with database with confirmations

export default function ActiveGame() {
  const route = useRoute();

  const game = route?.params?.game;
  const players = route?.params?.players;

  // console.log(route);

  const [activePlayers, setActivePlayers] = useState([]);
  // const [gameObject, setGameObject] = useState([]);

  useEffect(() => {
    (async () => {
      await gameStatus(game.id, "ACTIVE");

      const gamePlayers = await getGamePlayers();
      if (gamePlayers) {
        setActivePlayers(
          gamePlayers.filter((item: any) => item.game_id === game.id)
        );
      }
    })();
  }, []);

  const findPlayerName = (id: number) =>
    players.find((item: any) => item.id === id).name;

  const totalChips = () => {
    const buyins = activePlayers.length;
    const rebuys = activePlayers.reduce((a, b) => a + b.quantity_rebuy, 0);
    const buyInValue = game.buy_in_value;
    const totalBuyIns = buyins + rebuys;
    return totalBuyIns * buyInValue;
  };

  // const addRebuy = (id: number) => {
  //   const players = [...activePlayers];
  //   const idx = players.findIndex((item: any) => item.person_id === id);
  //   const player = players[idx];
  //   if (player) {
  //     player.quantity_rebuy++;
  //     player.chips = player.chips + game.buy_in_value;
  //     setActivePlayers(players);
  //   }
  //   // const rebuy = players[idx].quantity_rebuy++
  //   // players[idx] = [...players[idx], quantity_rebuy: ++1 ];
  //   // console.log(players);
  // };

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
        {activePlayers ? (
          activePlayers.map((player: any) => (
            <HStack
              key={player.id}
              space={6}
              justifyItems="space-between"
              alignItems="center"
              lineHeight="2xl"
            >
              <Text flex={3}>{findPlayerName(player.person_id)}</Text>
              <HStack flex={2} alignItems="center" justifyItems="space-between">
                <IconButton
                  colorScheme="muted"
                  _icon={{ as: Entypo, name: "minus" }}
                  flex={1}
                />
                <Text fontSize="lg" flex={2} textAlign="center">
                  {player.quantity_rebuy}
                </Text>
                <IconButton
                  colorScheme="muted"
                  _icon={{ as: Entypo, name: "plus" }}
                  flex={1}
                  onPress={() => addRebuy(player.id)}
                />
              </HStack>
              <Text flex={1} textAlign="center">
                {player.chips}
              </Text>
            </HStack>
          ))
        ) : (
          <Text>SOMETHING WENT WRONG</Text>
        )}
      </VStack>
      <br />
      <br />
      <VStack space={4}>
        <HStack space={8} justifyItems="space-between" alignItems="center">
          <Text flex={4} fontSize="xl">
            TOTAL CHIPS
          </Text>
          <Text flex={1} fontSize="xl" textAlign="right">
            {activePlayers ? totalChips() : 0}
          </Text>
        </HStack>
        <HStack space={8} justifyItems="space-between" alignItems="center">
          <Text flex={4} fontSize="sm">
            AVERAGE STACK
          </Text>
          <Text flex={1} fontSize="sm" textAlign="right">
            {activePlayers
              ? Math.round(totalChips() / activePlayers.length)
              : 0}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
