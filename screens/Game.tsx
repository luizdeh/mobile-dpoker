import React, { useEffect, useState } from "react";
import { Text, VStack, Button, HStack, Box } from "native-base";
import { getPlayers } from "../utils/fetchPlayers";
import { createNewGame } from "../utils/createNewGame";
import { addPlayerToGame } from "../utils/addPlayerToGame";
import { useNavigation } from "@react-navigation/native";
import { PlayerList } from "../lib/types";

export default function NewGame() {
  const [playerList, setPlayerList] = useState<PlayerList[]>([]);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const players = await getPlayers();
      if (players) setPlayerList(players);
    })();
  }, []);

  const gameParams = {
    buy_in_value: 1000,
    re_buy_value: 1000,
    chip_value: 0.01,
    status: "LOBBY",
  };

  const toggleRegisterPlayer = (id: number) => {
    setPlayerList((prev) => {
      const updatedList = [...prev];
      const idx = updatedList.findIndex((item: PlayerList) => item.id === id);
      updatedList[idx].active = !updatedList[idx].active;
      return updatedList;
    });
    console.log(playerList);
  };

  const startGame = async (players: any) => {
    const createdGame = await createNewGame(gameParams);
    if (createdGame) {
      for (const player of players) {
        if (player.active === true) {
          await addPlayerToGame(createdGame.id, player.id);
        } else {
          console.log(
            `[ERROR] Player not sent => ( ${player.id} ): ${player.name}`
          );
        }
      }

      navigation.navigate("Active Game", {
        game: createdGame,
        players: playerList,
      } as { game: any; players: any });
    }
  };

  return (
    <Box _dark={{ bg: "blueGray.900" }} _light={{ bg: "blueGray.50" }} h="100%">
      <Box flex={1}>
        <VStack space={1} alignItems="center">
          <HStack space={12} alignItems="center">
            <Text fontSize="md">Players:</Text>
            <Text fontSize="4xl">
              {playerList.filter((item: PlayerList) => item.active === true)
                .length ?? 0}
            </Text>
            <VStack alignItems="center" justifyContent="center">
              <Text fontSize="sm">TOTAL</Text>
              <Text fontSize="sm">{playerList.length}</Text>
            </VStack>
          </HStack>
          <br />
          {playerList
            ? playerList.map((player: PlayerList) => {
              return (
                <Button
                  onPress={() => {
                    toggleRegisterPlayer(player.id);
                  }}
                  key={player.id}
                  variant={player.active ? "solid" : "subtle"}
                  width="60%"
                  colorScheme="tertiary"
                  my="1"
                >
                  {player.name.toUpperCase()}
                </Button>
              );
            })
            : null}
        </VStack>
      </Box>
      <Box safeArea>
        <Button
          isDisabled={
            playerList.filter((item: PlayerList) => item.active === true)
              .length >= 5
              ? false
              : true
          }
          variant="solid"
          colorScheme="blueGray"
          width="100%"
          mb="0"
          minHeight="16"
          borderRadius="none"
          onPress={() => startGame(playerList)}
        >
          START GAME
        </Button>
      </Box>
    </Box>
  );
}
