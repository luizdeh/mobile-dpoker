import React, { useState, useEffect } from "react";
import {
  Text,
  HStack,
  Box,
  VStack,
  Divider,
  Button,
  Center,
} from "native-base";
import { useRoute, RouteProp } from "@react-navigation/native";
import { getGamePlayers } from "../utils/getGamePlayers";
import { gameStatus } from "../utils/gameStatus";
import ActivePlayer from "../components/ActivePlayer";
import { Player, PlayerList } from "../utils/types";
import { addPlayerToGame } from "../utils/addPlayerToGame";
import { Modal } from "native-base";

// TODO:
// interact with database with confirmations

// TODO:
// closing the game
// 1. create the function to update chips for each player
// 2. create the function to close the game in the db -> done
// 3. render the button
// 4. create the modal to update chips for each player

// TODO:
// adding a player
// 1. check if the function to add a player to a game works with the ACTIVE status
// 2. render the button -> modal with list of inactive players
// 3. render updated game
// 4. check if rebuys are working

type ParamsList = {
  Info: {
    game: any;
    players: any;
  };
};

export default function ActiveGame() {
  const [showModal, setShowModal] = useState(false);

  const route = useRoute<RouteProp<ParamsList, "Info">>();

  const game = route.params.game;
  const players = route.params.players;
  const inactive = players.filter((item: PlayerList) => item.active === false);

  // console.log(route);

  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [inactivePlayers, setInactivePlayers] = useState(inactive);
  const [addNewPlayers, setAddNewPlayers] = useState<[] | number[]>([]);

  useEffect(() => {
    console.log("activePlayers:", activePlayers);
  }, [activePlayers]);

  useEffect(() => {
    console.log("inactivePlayers:", inactivePlayers);
  }, [inactivePlayers]);

  useEffect(() => {
    (async () => {
      if (game && players) {
        await gameStatus(game.id, "ACTIVE");
        await buildPlayerObject();
      }
    })();
  }, [game, players]);

  useEffect(() => {
    (async () => {
      await buildPlayerObject();
    })();
  }, [inactivePlayers]);

  const buildPlayerObject = async () => {
    const gamePlayers = await getGamePlayers();
    if (gamePlayers) {
      const gamePlayersWithNames = gamePlayers
        .filter((item: any) => item.game_id === game.id)
        .map((item: any) => {
          const buy_in_value = game.buy_in_value;
          const re_buy_value = game.re_buy_value;
          const name = players.find(
            (player: any) => player.id === item.person_id
          ).name;
          return { ...item, name, buy_in_value, re_buy_value };
        });
      setActivePlayers(gamePlayersWithNames);
    }
  };

  const totalChips = () => {
    if (activePlayers.length === 0) return 0;
    const buyins = activePlayers.length;
    const rebuys = activePlayers.reduce((a, b) => a + b.quantity_rebuy, 0);
    return (buyins + rebuys) * game.buy_in_value;
  };

  const averageStack = () =>
    activePlayers.length ? Math.round(totalChips() / activePlayers.length) : 0;

  const toggleAddPlayers = (id: number) => {
    if (!!addNewPlayers.find((item: number) => item === id)) {
      setAddNewPlayers((state) => state.filter((item: number) => item !== id));
    } else {
      setAddNewPlayers((state) => [...state, id]);
    }
  };

  const sendNewPlayersToActiveGame = async () => {
    addNewPlayers.forEach(
      async (item: any) => await addPlayerToGame(game.id, item)
    );

    const cleanedInactive: any[] = [];

    inactivePlayers.forEach((item: any) => {
      addNewPlayers.forEach((player: any) => {
        if (item.id !== player) cleanedInactive.push(item);
      });
    });

    setInactivePlayers(cleanedInactive);
    setAddNewPlayers([]);
    setShowModal(false);
  };

  const renderModal = () => {
    return (
      <Center>
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Inactive Players</Modal.Header>
            <Modal.Body>
              <VStack space={2} alignItems="center">
                {inactivePlayers.map((item: { id: number; name: string }) => {
                  return (
                    <Button
                      onPress={() => toggleAddPlayers(item.id)}
                      key={item.id}
                      variant={
                        !!addNewPlayers.find(
                          (playerId: number) => playerId === item.id
                        )
                          ? "solid"
                          : "subtle"
                      }
                      width="60%"
                      colorScheme="tertiary"
                      my="1"
                    >
                      {item.name.toUpperCase()}
                    </Button>
                  );
                })}
              </VStack>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onPress={() => {
                    addNewPlayers.length >= 1
                      ? sendNewPlayersToActiveGame()
                      : setShowModal(false);
                  }}
                >
                  SAVE
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </Center>
    );
  };

  return (
    <Box
      _dark={{ bg: "blueGray.900" }}
      _light={{ bg: "blueGray.50" }}
      h="100%"
      w="100%"
    >
      {renderModal()}
      <Box flex={1} p={8}>
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
          <Center>
            <Button
              onPress={() => setShowModal(true)}
              variant="subtle"
              width="80%"
              colorScheme="tertiary"
              my="2"
            >
              ADD PLAYER
            </Button>
          </Center>
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
      <Box safeArea>
        <Button
          variant="subtle"
          colorScheme="blueGray"
          width="100%"
          mb="0"
          minHeight="16"
          borderRadius="none"
          onPress={() => setShowModal(true)}
        >
          GO TO CHIP COUNT
        </Button>
      </Box>
    </Box>
  );
}
