import React, { useEffect, useState } from "react";
import {
  Text,
  VStack,
  Button,
  HStack,
  Box,
  Input,
  Stack,
  Center,
  View,
} from "native-base";
import { getPlayers } from "../utils/db/fetchPlayers";
import { createNewGame } from "../utils/db/createNewGame";
import { addPlayerToGame } from "../utils/db/addPlayerToGame";
import { useNavigation } from "@react-navigation/native";
import { PlayerList, GameParamsNavigation, GameParams } from "../lib/types";
import { ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useGamesContext from "../context/useGamesContext";

export default function NewGame() {

  const { players } = useGamesContext()

  const [playerList, setPlayerList] = useState<PlayerList[]>([]);
  const [gameParams, setGameParams] = useState<GameParams>({
    buy_in_value: 1000,
    re_buy_value: 1000,
    chip_value: 0.01,
    status: "LOBBY",
  });
  const [buyInAmount, setBuyInAmount] = useState<number>(10);

  const navigation =
    useNavigation<NativeStackNavigationProp<GameParamsNavigation>>();

  useEffect(() => {
    // if (players) setPlayerList(players);
    if (players) setPlayerList(players.filter((item: PlayerList) => item.is_active === 1));
    console.log({ players });
  }, []);

  const toggleRegisterPlayer = (id: number) => {
    setPlayerList((prev) => {
      const updatedList = [...prev];
      const idx = updatedList.findIndex((item: PlayerList) => item.id === id);
      updatedList[idx].active = !updatedList[idx].active;
      return updatedList;
    });
  };

  const clearPlayers = () => {
    setPlayerList((prev) => {
      const updatedList = [...prev];
      for (const player of updatedList) {
        player.active = false;
      }
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
      navigation.navigate("ActiveGame", {
        game: createdGame,
        players: playerList,
      });
    }
  };

  const gameValue = gameParams.buy_in_value.toLocaleString().replace(",", ".");
  const rebuyValue = gameParams.re_buy_value.toLocaleString().replace(",", ".");

  const enableResetGameParams = () => {
    const temp = gameParams;
    if (
      temp.buy_in_value !== 1000 ||
      temp.re_buy_value !== 1000 ||
      buyInAmount !== 10
    ) {
      return true;
    }
  };

  return (
    <Box backgroundColor="black" flex={1}>
      <VStack space={1} alignItems="center" flex={1} mt={4}>
        <HStack px={2} mb={4} space={1}>
          <VStack
            minW="70%"
            flex={1}
            borderRadius="lg"
            backgroundColor="blueGray.600"
            py={1}
            px={2}
            space={2}
          >
            <Text
              textAlign="center"
              color="blueGray.300"
              fontSize="xs"
              bold
              flex={1}
            >
              GAME PARAMETERS
            </Text>
            <HStack flex={1} alignItems="center">
              <Text color="teal.300" fontSize="10" flex={2} bold>
                BUY IN CHIPS
              </Text>
              <Input
                size="xs"
                p={1}
                flex={1}
                textAlign="center"
                fontWeight="semibold"
                fontSize="10"
                variant="filled"
                color="teal.400"
                borderColor="blueGray.800"
                backgroundColor="blueGray.800"
                value={gameValue}
                keyboardType="number-pad"
                onChangeText={(val) => {
                  setGameParams((prev) => {
                    const obj = { ...prev };
                    return { ...obj, buy_in_value: Number(val) };
                  });
                }}
              />
            </HStack>
            <HStack flex={1} alignItems="center">
              <Text color="teal.300" fontSize="10" flex={2} bold>
                REBUY CHIPS
              </Text>
              <Input
                size="xs"
                p={1}
                flex={1}
                textAlign="center"
                fontWeight="semibold"
                fontSize="10"
                variant="filled"
                color="teal.400"
                borderColor="blueGray.800"
                backgroundColor="blueGray.800"
                value={rebuyValue}
                keyboardType="number-pad"
                onChangeText={(val) => {
                  setGameParams((prev) => {
                    const obj = { ...prev };
                    return { ...obj, re_buy_value: Number(val) };
                  });
                }}
              />
            </HStack>
            <HStack flex={1} alignItems="center">
              <Text color="teal.300" fontSize="10" flex={2} bold>
                BUY IN AMOUNT
              </Text>
              <Input
                size="xs"
                p={1}
                flex={1}
                textAlign="center"
                fontWeight="semibold"
                fontSize="10"
                variant="filled"
                color="teal.400"
                borderColor="blueGray.800"
                backgroundColor="blueGray.800"
                value={buyInAmount.toString()}
                keyboardType="number-pad"
                onChangeText={(val) => setBuyInAmount(Number(val))}
              />
            </HStack>
            <Center>
              <Button
                size="xs"
                variant="solid"
                width="50%"
                borderRadius="md"
                px={0}
                py={1}
                mb={1}
                _text={{ fontSize: 10 }}
                isDisabled={enableResetGameParams() ? false : true}
                onPress={() =>
                  setGameParams({
                    buy_in_value: 1000,
                    re_buy_value: 1000,
                    chip_value: 0.01,
                    status: "LOBBY",
                  })
                }
                colorScheme="teal"
              >
                RESET
              </Button>
            </Center>
          </VStack>
          <VStack
            minW="30%"
            flex={1}
            borderRadius="lg"
            backgroundColor="blueGray.600"
            px={1}
            pt={1}
            pb={0}
            space={2}
          >
            <VStack flex={1} alignItems="center" justifyContent="space-evenly">
              <Text fontSize="xs" color="blueGray.300" bold>
                PLAYERS
              </Text>
              <Text fontSize="4xl" color="teal.400">
                {playerList.filter((item: PlayerList) => item.active === true)
                  .length ?? 0}
              </Text>
              <Button
                size="xs"
                variant="solid"
                width="80%"
                borderRadius="md"
                px={4}
                py={1}
                _text={{ fontSize: 10 }}
                isDisabled={
                  playerList.filter((item: PlayerList) => item.active === true)
                    .length
                    ? false
                    : true
                }
                onPress={clearPlayers}
                colorScheme="teal"
              >
                CLEAR
              </Button>
            </VStack>
          </VStack>
        </HStack>
        <ScrollView style={{ width: "100%" }}>
          <View alignItems="center" w="100%" flexWrap="wrap" flexDirection="row" justifyContent="center">
            {playerList
              ? playerList
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((player: PlayerList, idx: number) => {
                  return (
                    <Button
                      onPress={() => {
                        toggleRegisterPlayer(player.id);
                      }}
                      key={player.id}
                      variant={player.active ? "solid" : "subtle"}
                      width="40%"
                      colorScheme="emerald"
                      m={1}
                      py={4}
                    >
                      <Text fontSize="xs" fontWeight={player.active ? "bold" : "normal"} color={player.active ? "white" : "green.900"}>{player.name.toUpperCase()}</Text>
                    </Button>
                  );
                })
              : null}
          </View>
        </ScrollView>
      </VStack>
      <Box safeArea mt={2}>
        <Button
          isDisabled={
            playerList.filter((item: PlayerList) => item.active === true)
              .length >= 4
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
          _text={{ fontSize: "lg" }}
        >
          START GAME
        </Button>
      </Box>
    </Box>
  );
}