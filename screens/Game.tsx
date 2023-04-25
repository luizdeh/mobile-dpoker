import React, { useEffect, useState } from "react";
import { Text, VStack, Button, HStack, Box } from "native-base";
import { getPlayers } from "../utils/fetchPlayers";
import { createNewGame } from "../utils/createNewGame";
import { addPlayerToGame } from "../utils/addPlayerToGame";
import { ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { gameStatus } from "../utils/gameStatus";
import { getAllGames } from "../utils/getAllGames";

// TODO:
// treat players as pills ( no buttons )
// PLayers: 0 / *total*
// start game button -> disabled until 5 players
// bulk request -> { gameId: 'id', players: [1,2,3] }
// footer

// FIX:
// players are not being removed from the gamePlayers table

export default function NewGame() {
  const [playerList, setPlayerList] = useState([]);
  const [newGame, setNewGame] = useState([]);
  const [registeredPlayers, setRegisteredPlayers] = useState([]);

  useEffect(() => {
    (async () => {
      const players = await getPlayers();
      if (players) setPlayerList(players);

      const createdGame = await createNewGame(gameParams);
      if (createdGame) setNewGame(createdGame);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const games = await getAllGames();
      if (games) {
        const oldGames = games.filter((item: any) => item.id !== newGame.id);
        oldGames.forEach((item: any) => {
          if (item.status === "LOBBY" || item.status === "ACTIVE") {
            return gameStatus(item.id, "CLOSED");
          }
        });
      }
    })();
  }, [newGame]);

  const navigation = useNavigation();

  const activateGame = () => {
    navigation.navigate("Active Game", {
      game: newGame,
      players: registeredPlayers,
    });
  };

  const gameParams = {
    buy_in_value: 1000,
    re_buy_value: 1000,
    chip_value: 0.01,
    status: "LOBBY",
  };

  const checkDoubleEntry = (array: any, playerId: number) =>
    !!array.find((item: any) => item.id === playerId);

  const addPlayerToList = (player: any) => {
    if (registeredPlayers.length === 0) {
      setRegisteredPlayers([player]);
    } else {
      const check = checkDoubleEntry(registeredPlayers, player.id);
      if (!check) {
        setRegisteredPlayers([...registeredPlayers, player]);
      }
    }
  };

  const isPlayerRegistered = (id: number) =>
    !!registeredPlayers.find((item: any) => item.id === id);

  const unregisterPlayer = (player: any) =>
    setRegisteredPlayers(
      registeredPlayers.filter((item: any) => item.id !== player.id)
    );

  const startGame = (players: any) => {
    players.forEach((item: any) => addPlayerToGame(newGame.id, item.id));
    activateGame();
  };

  return (
    <Box _dark={{ bg: "blueGray.900" }} _light={{ bg: "blueGray.50" }} h="100%">
      <Box flex={1}>
        <VStack space={1} alignItems="center">
          <Box>
            <Text>
              Currently registering for game #
              {newGame ? newGame.id : "NOT FOUND"}
            </Text>
          </Box>
          <br />
          <HStack space={12} alignItems="center">
            <Text fontSize="md">Players:</Text>
            <Text fontSize="4xl">{registeredPlayers.length ?? 0}</Text>
            <VStack alignItems="center" justifyContent="center">
              <Text fontSize="sm">TOTAL</Text>
              <Text fontSize="sm">{playerList.length}</Text>
            </VStack>
          </HStack>
          <br />
          {playerList ? (
            playerList.map((item: any) => {
              const active = isPlayerRegistered(item.id);
              if (active) {
                return (
                  <Button
                    onPress={() => {
                      unregisterPlayer(item);
                    }}
                    key={item.id + item.name}
                    variant="solid"
                    width="60%"
                    colorScheme="tertiary"
                    my="1"
                  >
                    {item.name.toUpperCase()}
                  </Button>
                );
              } else {
                return (
                  <Button
                    onPress={() => addPlayerToList(item)}
                    key={item.id + item.name}
                    variant="subtle"
                    width="60%"
                    colorScheme="tertiary"
                    my="1"
                  >
                    {item.name.toUpperCase()}
                  </Button>
                );
              }
            })
          ) : (
            <Text>No players registered yet.</Text>
          )}
        </VStack>
      </Box>
      <Box safeArea>
        <Button
          isDisabled={registeredPlayers.length >= 5 ? false : true}
          variant="solid"
          colorScheme="blueGray"
          width="100%"
          mb="0"
          minHeight="16"
          borderRadius="none"
          onPress={() => startGame(registeredPlayers)}
        >
          START GAME
        </Button>
      </Box>
    </Box>
  );
}
