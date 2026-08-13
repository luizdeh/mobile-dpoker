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
  ScrollView,
  useToast,
} from "native-base";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ActivePlayer from "../components/ActivePlayer";
import { getGamePlayers } from "../utils/db/getGamePlayers";
import { gameStatus } from "../utils/db/gameStatus";
import { addPlayerToGame } from "../utils/db/addPlayerToGame";
import { Player, PlayerList, GameParamsNavigation } from "../lib/types";
import { updateChips } from "../utils/db/updateChips";
import { endGame } from "../utils/db/endGame";
import { releaseGameLock } from "../utils/db/releaseGameLock";
import { removePlayerFromGame } from "../utils/db/removePlayerFromGame";
import { loadChipCounts, saveChipCounts, clearChipCounts } from "../lib/chipCountStorage";
import useGamesContext from "../context/useGamesContext";
import useAuthContext from "../context/useAuthContext";

export default function ActiveGame() {

  const { fetchGames, fetchGamePlayers } = useGamesContext();
  const { canManage, scheduleAutoLogout } = useAuthContext();
  const toast = useToast();

  const [showInactivesModal, setShowInactivesModal] = useState(false);
  const [closeGameError, setCloseGameError] = useState<string | null>(null);
  const [isClosingGame, setIsClosingGame] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      const savedCounts = await loadChipCounts(game.id);
      const gamePlayersWithNames = gamePlayers
        .filter((item: any) => item.game_id === game.id)
        .map((item: any) => {
          const buy_in_value = game.buy_in_value;
          const re_buy_value = game.re_buy_value;
          const name = players.find(
            (player: any) => player.id === item.person_id
          ).name;
          const saved = savedCounts[item.id];
          return {
            ...item,
            name,
            buy_in_value,
            re_buy_value,
            final_chips: saved?.final_chips ?? 0,
            chips_counted: saved?.chips_counted ?? false,
          };
        });
      setActivePlayers(gamePlayersWithNames);
    }
  };

  useEffect(() => {
    if (!activePlayers.length) return;
    const counts = activePlayers.reduce((acc, item) => {
      acc[item.id] = { final_chips: item.final_chips, chips_counted: !!item.chips_counted };
      return acc;
    }, {} as Record<number, { final_chips: number; chips_counted: boolean }>);
    saveChipCounts(game.id, counts);
  }, [activePlayers]);

  const totalChips = () => {
    if (activePlayers.length === 0) return 0;
    const buyins = activePlayers.length;
    const rebuys = activePlayers.reduce((a, b) => a + b.quantity_rebuy, 0);
    return (buyins + rebuys) * game.buy_in_value;
  };

  const countedChips = () => activePlayers.reduce((a, b) => a + b.final_chips, 0);

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

    const addedIds = new Set(addNewPlayers);
    const cleanedInactive = inactivePlayers.filter((item: any) => !addedIds.has(item.id));

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
          <Modal.Content maxWidth="400px" backgroundColor="blueGray.900">
            <Modal.CloseButton _icon={{ color: "blueGray.400" }} />
            <Modal.Header backgroundColor="blueGray.900" borderColor="blueGray.800">
              <Text color="white" bold>Inactive Players</Text>
            </Modal.Header>
            <Modal.Body>
              <VStack space={2} alignItems="center">
                {inactivePlayers.map((item: { id: number; name: string }) => {
                  const isSelected = !!addNewPlayers.find(
                    (playerId: number) => playerId === item.id
                  );
                  return (
                    <Button
                      onPress={() => toggleAddPlayers(item.id)}
                      key={item.id}
                      variant={isSelected ? "solid" : "outline"}
                      width="60%"
                      colorScheme="teal"
                      borderColor={isSelected ? undefined : "blueGray.700"}
                      _text={isSelected ? undefined : { color: "blueGray.300" }}
                      my="1"
                    >
                      {item.name.toUpperCase()}
                    </Button>
                  );
                })}
              </VStack>
            </Modal.Body>
            <Modal.Footer backgroundColor="blueGray.900" borderColor="blueGray.800">
              <Button.Group space={2}>
                <Button
                  variant="ghost"
                  colorScheme="blueGray"
                  onPress={() => setShowInactivesModal(false)}
                >
                  CANCEL
                </Button>
                <Button
                  colorScheme="teal"
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

  const handleChipChange = (id: number, value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, "");
    const final_chips = digitsOnly === "" ? 0 : Number(digitsOnly);

    setActivePlayers((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, final_chips, chips_counted: true } : item
      )
    );
  };

  const navigation = useNavigation<NativeStackNavigationProp<GameParamsNavigation>>();

  const closeGame = async (): Promise<boolean> => {
    setIsClosingGame(true);
    setCloseGameError(null);

    const failedUpdates = [];
    for (const player of activePlayers) {
      const res = await updateChips(player.id, player.final_chips);
      if (res?.error) failedUpdates.push(player.name);
    }
    if (failedUpdates.length > 0) {
      setIsClosingGame(false);
      setCloseGameError(`Failed to save chip counts for: ${failedUpdates.join(", ")}. Please try again.`);
      return false;
    }

    const closedGame = await endGame(game.id);
    if (!closedGame) {
      setIsClosingGame(false);
      setCloseGameError("Failed to close the game in Supabase. Please try again.");
      return false;
    }

    await Promise.all([fetchGames(), fetchGamePlayers(), releaseGameLock(game.id)]);
    await clearChipCounts(game.id);
    setIsClosingGame(false);
    scheduleAutoLogout();
    toast.show({ description: "Game saved to Supabase successfully. You'll be signed out in 5 minutes." });
    navigation.navigate("Home");
    return true;
  };

  const handleRemovePlayer = async (player: Player) => {
    const success = await removePlayerFromGame(player.id);
    if (!success) return;
    setActivePlayers((prev) => prev.filter((item) => item.id !== player.id));
    setInactivePlayers((prev) => [...prev, { id: player.person_id, name: player.name }]);
    setExpandedId((prev) => (prev === player.id ? null : prev));
  };

  const countedPlayers = activePlayers.filter((player) => player.chips_counted);

  return (
    <Box backgroundColor="black" h="100%" w="100%">
      {renderInactivesModal()}
      <Box flex={1} p={8} pb={3}>
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <VStack flex={1}>
            <HStack space={3} justifyContent="space-between" alignItems="center">
              <Text flex={3} fontSize="10" color="blueGray.400" bold isTruncated>
                PLAYER
              </Text>
              <Text flex={2} fontSize="10" color="blueGray.400" bold textAlign="center" isTruncated>
                RE-BUYS
              </Text>
              <Text flex={1} fontSize="10" color="blueGray.400" bold textAlign="right" isTruncated>
                STATUS
              </Text>
            </HStack>
            <Divider my="2" backgroundColor="blueGray.800" />
            <VStack w="100%" space={2}>
              {activePlayers
                ? activePlayers.map((player: Player) => (
                  <ActivePlayer
                    key={player.id}
                    player={player}
                    updateActivePlayers={setActivePlayers}
                    isExpanded={expandedId === player.id}
                    onToggleExpand={() =>
                      setExpandedId((prev) => (prev === player.id ? null : player.id))
                    }
                    onChipChange={handleChipChange}
                    onRemove={handleRemovePlayer}
                  />
                ))
                : null}
            </VStack>
            {canManage ? (
              <Center>
                <Button
                  onPress={() => setShowInactivesModal(true)}
                  variant="solid"
                  width="80%"
                  colorScheme="blueGray"
                  mt={4}
                >
                  ADD PLAYER
                </Button>
              </Center>
            ) : null}
            {countedPlayers.length ? (
              <VStack mt={6} space={0}>
                <Text fontSize="10" color="blueGray.500" bold mb={1}>
                  COUNTED
                </Text>
                {countedPlayers.map((player, index) => (
                  <HStack
                    key={player.id}
                    justifyContent="space-between"
                    px={2}
                    py={1}
                    backgroundColor={index % 2 === 0 ? "blueGray.900" : "transparent"}
                  >
                    <Text fontSize="xs" color="blueGray.300" flexShrink={1} isTruncated>
                      {player.name.toUpperCase()}
                    </Text>
                    <Text fontSize="xs" color="blueGray.300" flexShrink={0} ml={2}>
                      {player.final_chips}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            ) : null}
          </VStack>
        </ScrollView>
        <VStack space={1} mt={2}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="lg" color="white" bold>
              TOTAL CHIPS
            </Text>
            <Text
              fontSize="lg"
              textAlign="right"
              color={countedChips() === totalChips() ? "teal.400" : "blueGray.600"}
              bold
            >
              {countedChips()} / {totalChips()}
            </Text>
          </HStack>
          {closeGameError ? (
            <Text color="red.400" fontSize="xs" textAlign="center">{closeGameError}</Text>
          ) : null}
        </VStack>
      </Box>
      {canManage ? (
        <Box safeArea>
          <Button
            variant="solid"
            colorScheme="blueGray"
            width="100%"
            mb="0"
            minHeight="12"
            borderRadius="none"
            isDisabled={countedChips() !== totalChips() || isClosingGame}
            isLoading={isClosingGame}
            onPress={closeGame}
          >
            END GAME
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
