import React, { useState, useEffect } from "react";
import {
  Text,
  HStack,
  Box,
  VStack,
  Divider,
  Button,
  Center,
  Modal,
  Input,
} from "native-base";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import ActivePlayer from "../components/ActivePlayer";
import { getGamePlayers } from "../utils/db/getGamePlayers";
import { gameStatus } from "../utils/db/gameStatus";
import { addPlayerToGame } from "../utils/db/addPlayerToGame";
import { Player, PlayerList, GameParamsNavigation } from "../lib/types";
import { updateChips } from "../utils/db/updateChips";
import { endGame } from "../utils/db/endGame";

// TODO:
// interact with database with confirmations

export default function ActiveGame() {
  const [showInactivesModal, setShowInactivesModal] = useState(false);
  const [showChipCountModal, setShowChipCountModal] = useState(false);

  const route = useRoute<RouteProp<GameParamsNavigation, "ActiveGame">>();

  const game = route.params.game;
  const players = route.params.players;
  const inactive = players.filter((item: PlayerList) => item.active === false);

  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [inactivePlayers, setInactivePlayers] = useState(inactive);
  const [addNewPlayers, setAddNewPlayers] = useState<[] | number[]>([]);

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
          return { ...item, name, buy_in_value, re_buy_value, final_chips: 0 };
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
    setShowInactivesModal(false);
  };

  const renderInactivesModal = () => {
    return (
      <Center>
        <Modal
          isOpen={showInactivesModal}
          onClose={() => setShowInactivesModal(false)}
        >
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
                  onPress={() => setShowInactivesModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onPress={() => {
                    addNewPlayers.length >= 1
                      ? sendNewPlayersToActiveGame()
                      : setShowInactivesModal(false);
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

  const handleChange = (event: any, index: number) => {
    const { value } = event.target;

    const newState = [...activePlayers];
    newState[index] = { ...activePlayers[index], final_chips: Number(value) };
    setActivePlayers(newState);
  };

  const navigation = useNavigation();

  const closeGame = async () => {
    let results = [];
    for (const player of activePlayers) {
      const res = await updateChips(player.id, player.final_chips);
      if (res.error)
        results.push({ id: player.id, final_chips: player.final_chips });
    }
    if (results.length === 0) {
      await endGame(game.id);
      console.log("game ended");
      navigation.navigate("Home");
    } else {
      console.log({ results });
    }
  };

  const renderChipCountModal = () => {
    return (
      <Center>
        <Modal
          isOpen={showChipCountModal}
          onClose={() => setShowChipCountModal(false)}
        >
          <Modal.Content maxWidth="400px">
            <Modal.CloseButton />
            <Modal.Header>Close Game</Modal.Header>
            <Modal.Body>
              <VStack space={2}>
                {activePlayers.map((item, index) => {
                  return (
                    <HStack
                      space={6}
                      justifyItems="space-between"
                      alignItems="center"
                      lineHeight="2xl"
                      key={item.id}
                    >
                      <Text flex={3}>{item.name.toUpperCase()}</Text>
                      <Input
                        flex={2}
                        name="final_chips"
                        value={item.final_chips}
                        keyboardType="numeric"
                        maxLength={5}
                        onChange={(e: any) => handleChange(e, index)}
                      />
                    </HStack>
                  );
                })}
              </VStack>
              <br />
              <HStack
                justifyItems="space-between"
                alignItems="baseline"
                lineHeight="2xl"
              >
                <Text flex={2}>TOTAL</Text>
                <HStack space={2} flex={1} justifyItems="space-between">
                  <Text flex={2} textAlign="right" fontSize="md">
                    {activePlayers.reduce((a, b) => a + b.final_chips, 0)}
                  </Text>
                  <Text flex={1} textAlign="right" fontSize="xs">
                    / {totalChips()}
                  </Text>
                </HStack>
              </HStack>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => setShowChipCountModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  isDisabled={
                    activePlayers.reduce((a, b) => a + b.final_chips, 0) ===
                      totalChips()
                      ? false
                      : true
                  }
                  onPress={() => {
                    closeGame();
                    setShowChipCountModal(false);
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
      {renderInactivesModal()}
      {renderChipCountModal()}
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
              onPress={() => setShowInactivesModal(true)}
              variant="subtle"
              width="60%"
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
          onPress={() => setShowChipCountModal(true)}
        >
          GO TO CHIP COUNT
        </Button>
      </Box>
    </Box>
  );
}
