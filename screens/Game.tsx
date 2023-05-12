import React, { useEffect, useState } from "react";
import { Text, VStack, Button, HStack, Box, Input, Stack } from "native-base";
import { getPlayers } from "../utils/fetchPlayers";
import { createNewGame } from "../utils/createNewGame";
import { addPlayerToGame } from "../utils/addPlayerToGame";
import { useNavigation } from "@react-navigation/native";
import { PlayerList } from "../lib/types";
import { ScrollView } from "react-native";

type GameParams = {
  buy_in_value: number;
  re_buy_value: number;
  chip_value: number;
  status: string;
};

export default function NewGame() {
  const [playerList, setPlayerList] = useState<PlayerList[]>([]);
  const [gameParams, setGameParams] = useState<GameParams>({
    buy_in_value: 1000,
    re_buy_value: 1000,
    chip_value: 0.01,
    status: "LOBBY",
  });
  const [buyInAmount, setBuyInAmount] = useState(10);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const players = await getPlayers();
      if (players) setPlayerList(players);
    })();
  }, []);

  const toggleRegisterPlayer = (id: number) => {
    setPlayerList((prev) => {
      const updatedList = [...prev];
      const idx = updatedList.findIndex((item: PlayerList) => item.id === id);
      updatedList[idx].active = !updatedList[idx].active;
      return updatedList;
    });
  };

  useEffect(() => {
    setGameParams((prev) => {
      const obj = { ...prev };
      return { ...obj, chip_value: buyInAmount / gameParams.buy_in_value };
    });
  }, [buyInAmount]);

  const startGame = async (players: any) => {
    const createdGame = await createNewGame(gameParams);
    if (createdGame) {
      for (const player of players) {
        if (player.active === true)
          await addPlayerToGame(createdGame.id, player.id);
      }
      navigation.navigate("Active Game", {
        game: createdGame,
        players: playerList,
      } as { game: any; players: any });
    }
  };

  return (
    <Box _dark={{ bg: "blueGray.900" }} _light={{ bg: "blueGray.50" }} h="100%">
      <ScrollView style={{ width: "100%", marginHorizontal: 10 }}>
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
            <Text fontSize="md">Game Parameters</Text>
            <VStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text>Buy in Chips</Text>
                <Input
                  textAlign="center"
                  variant="underlined"
                  value={gameParams.buy_in_value.toString()}
                  keyboardType="number-pad"
                  onChangeText={(val) => {
                    setGameParams((prev) => {
                      const obj = { ...prev };
                      return { ...obj, buy_in_value: Number(val) };
                    });
                  }}
                />
              </HStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text>Re-buy Chips</Text>
                <Input
                  textAlign="center"
                  variant="underlined"
                  value={gameParams.re_buy_value.toString()}
                  keyboardType="number-pad"
                  onChangeText={(val) => {
                    setGameParams((prev) => {
                      const obj = { ...prev };
                      return { ...obj, re_buy_value: Number(val) };
                    });
                  }}
                />
              </HStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text>Buy in Amount</Text>
                <Input
                  textAlign="center"
                  variant="underlined"
                  value={buyInAmount.toString()}
                  keyboardType="number-pad"
                  onChangeText={(val) => setBuyInAmount(Number(val))}
                />
              </HStack>
            </VStack>
            <br />
            <Stack alignItems="center" w="100%">
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
            </Stack>
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
      </ScrollView>
    </Box>
  );
}
