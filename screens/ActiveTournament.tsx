import React, { useEffect, useState } from "react";
import {
  Text,
  HStack,
  Box,
  VStack,
  Divider,
  Button,
  IconButton,
  Center,
  Modal,
  ScrollView,
  Icon,
  useToast,
} from "native-base";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getTournamentPlayers } from "../utils/db/getTournamentPlayers";
import { tournamentStatus } from "../utils/db/tournamentStatus";
import { addPlayerToTournament } from "../utils/db/addPlayerToTournament";
import { addTournamentRebuy } from "../utils/db/addTournamentRebuy";
import { removeTournamentRebuy } from "../utils/db/removeTournamentRebuy";
import { eliminatePlayer } from "../utils/db/eliminatePlayer";
import { undoEliminatePlayer } from "../utils/db/undoEliminatePlayer";
import { removePlayerFromTournament } from "../utils/db/removePlayerFromTournament";
import { TournamentPlayer, PlayerList, TournamentParamsNavigation } from "../lib/types";
import useAuthContext from "../context/useAuthContext";

const ordinal = (n: number) => {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}TH`;
  switch (n % 10) {
    case 1: return `${n}ST`;
    case 2: return `${n}ND`;
    case 3: return `${n}RD`;
    default: return `${n}TH`;
  }
};

export default function ActiveTournament() {
  const { canManage } = useAuthContext();
  const toast = useToast();

  const route = useRoute<RouteProp<TournamentParamsNavigation, "ActiveTournament">>();
  const tournament = route.params.tournament;
  const players = route.params.players;
  const inactive = players.filter((item: PlayerList) => item.active === false);

  const [entries, setEntries] = useState<TournamentPlayer[]>([]);
  const [inactivePlayers, setInactivePlayers] = useState<{ id: number; name: string }[]>(inactive);
  const [addNewPlayers, setAddNewPlayers] = useState<[] | number[]>([]);
  const [showInactivesModal, setShowInactivesModal] = useState(false);
  const [lastAction, setLastAction] = useState<{ eliminatedId: number; championId: number | null } | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<TournamentParamsNavigation>>();

  const buildEntries = async () => {
    const tournamentPlayers = await getTournamentPlayers();
    if (tournamentPlayers) {
      const withNames = tournamentPlayers
        .filter((item: any) => item.tournament_id === tournament.id)
        .map((item: any) => ({
          ...item,
          name: players.find((player: any) => player.id === item.person_id)?.name ?? "",
        }));
      setEntries(withNames);
    }
  };

  useEffect(() => {
    (async () => {
      if (tournament && players) {
        await tournamentStatus(tournament.id, "ACTIVE");
        await buildEntries();
      }
    })();
  }, [tournament, players]);

  const activeEntries = entries.filter((entry) => entry.finish_position == null);
  const eliminatedEntries = [...entries]
    .filter((entry) => entry.finish_position != null)
    .sort((a, b) => (a.finish_position as number) - (b.finish_position as number));

  const handleRebuy = async (entry: TournamentPlayer) => {
    setEntries((prev) => prev.map((item) => (item.id === entry.id ? { ...item, quantity_rebuy: item.quantity_rebuy + 1 } : item)));
    const result: any = await addTournamentRebuy(entry.id);
    if (!result || result.error) {
      setEntries((prev) => prev.map((item) => (item.id === entry.id ? { ...item, quantity_rebuy: entry.quantity_rebuy } : item)));
    }
  };

  const handleRemoveRebuy = async (entry: TournamentPlayer) => {
    if (entry.quantity_rebuy <= 0) return;
    setEntries((prev) =>
      prev.map((item) => (item.id === entry.id ? { ...item, quantity_rebuy: item.quantity_rebuy - 1 } : item))
    );
    const result: any = await removeTournamentRebuy(entry.id);
    if (!result || result.error) {
      setEntries((prev) => prev.map((item) => (item.id === entry.id ? { ...item, quantity_rebuy: entry.quantity_rebuy } : item)));
    }
  };

  const handleEliminate = async (entry: TournamentPlayer) => {
    const position = activeEntries.length;
    const remainingAfter = activeEntries.filter((item) => item.id !== entry.id);
    const champion = remainingAfter.length === 1 ? remainingAfter[0] : null;

    setEntries((prev) =>
      prev.map((item) => {
        if (item.id === entry.id) return { ...item, finish_position: position };
        if (champion && item.id === champion.id) return { ...item, finish_position: 1 };
        return item;
      })
    );
    setLastAction({ eliminatedId: entry.id, championId: champion?.id ?? null });

    await eliminatePlayer(entry.id, position);
    if (champion) await eliminatePlayer(champion.id, 1);
  };

  const handleUndo = async () => {
    if (!lastAction) return;
    const { eliminatedId, championId } = lastAction;
    setEntries((prev) =>
      prev.map((item) => {
        if (item.id === eliminatedId) return { ...item, finish_position: null };
        if (championId && item.id === championId) return { ...item, finish_position: null };
        return item;
      })
    );
    await undoEliminatePlayer(eliminatedId);
    if (championId) await undoEliminatePlayer(championId);
    setLastAction(null);
  };

  const toggleAddPlayers = (id: number) => {
    if (addNewPlayers.find((item: number) => item === id)) {
      setAddNewPlayers((state) => state.filter((item: number) => item !== id));
    } else {
      setAddNewPlayers((state) => [...state, id]);
    }
  };

  const sendNewPlayersToTournament = async () => {
    for (const id of addNewPlayers) {
      await addPlayerToTournament(tournament.id, id);
    }
    const addedIds = new Set(addNewPlayers);
    setInactivePlayers((prev) => prev.filter((item: any) => !addedIds.has(item.id)));
    setAddNewPlayers([]);
    setShowInactivesModal(false);
    await buildEntries();
  };

  const handleRemoveEntry = async (entry: TournamentPlayer) => {
    const success = await removePlayerFromTournament(entry.id);
    if (!success) return;
    setEntries((prev) => prev.filter((item) => item.id !== entry.id));
    setInactivePlayers((prev) => [...prev, { id: entry.person_id, name: entry.name ?? "" }]);
  };

  const allEliminated = entries.length > 0 && activeEntries.length === 0;

  const handleEndTournament = () => {
    navigation.navigate("TournamentPayouts", { tournament });
  };

  const renderInactivesModal = () => (
    <Center>
      <Modal isOpen={showInactivesModal} onClose={() => setShowInactivesModal(false)}>
        <Modal.Content maxWidth="400px" backgroundColor="blueGray.900">
          <Modal.CloseButton _icon={{ color: "blueGray.400" }} />
          <Modal.Header backgroundColor="blueGray.900" borderColor="blueGray.800">
            <Text color="white" bold>Inactive Players</Text>
          </Modal.Header>
          <Modal.Body>
            <VStack space={2} alignItems="center">
              {inactivePlayers.map((item: { id: number; name: string }) => {
                const isSelected = !!addNewPlayers.find((playerId: number) => playerId === item.id);
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
              <Button variant="ghost" colorScheme="blueGray" onPress={() => setShowInactivesModal(false)}>
                CANCEL
              </Button>
              <Button
                colorScheme="teal"
                onPress={() => (addNewPlayers.length >= 1 ? sendNewPlayersToTournament() : setShowInactivesModal(false))}
              >
                SAVE
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Center>
  );

  return (
    <Box backgroundColor="black" h="100%" w="100%">
      {renderInactivesModal()}
      <Box flex={1} p={8} pb={3}>
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <VStack flex={1}>
            <Text fontSize="10" color="blueGray.400" bold mb={1}>
              STILL PLAYING ({activeEntries.length})
            </Text>
            <Divider mb="2" backgroundColor="blueGray.800" />
            <VStack w="100%" space={2}>
              {activeEntries.map((entry: TournamentPlayer) => (
                <HStack key={entry.id} justifyContent="space-between" alignItems="center">
                  <VStack flex={1}>
                    <Text color="white" fontSize="sm" isTruncated>
                      {(entry.name ?? "").toUpperCase()}
                    </Text>
                    {entry.quantity_rebuy > 0 ? (
                      <Text color="blueGray.400" fontSize="10">
                        {entry.quantity_rebuy} REBUY{entry.quantity_rebuy > 1 ? "S" : ""}
                      </Text>
                    ) : null}
                  </VStack>
                  {canManage ? (
                    <HStack alignItems="center" space={1}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        _icon={{ as: AntDesign, name: "minuscircleo", size: "sm", color: "blueGray.600" }}
                        isDisabled={entry.quantity_rebuy <= 0}
                        onPress={() => handleRemoveRebuy(entry)}
                      />
                      <IconButton
                        size="sm"
                        variant="ghost"
                        _icon={{ as: MaterialIcons, name: "add-circle-outline", size: "sm", color: "teal.400" }}
                        onPress={() => handleRebuy(entry)}
                      />
                      <Button size="sm" variant="outline" colorScheme="rose" onPress={() => handleEliminate(entry)}>
                        OUT
                      </Button>
                    </HStack>
                  ) : null}
                </HStack>
              ))}
              {!activeEntries.length && !eliminatedEntries.length ? (
                <Text color="blueGray.400" fontSize="xs" textAlign="center" mt={2}>
                  No players registered yet.
                </Text>
              ) : null}
            </VStack>

            {canManage ? (
              <Center>
                <Button onPress={() => setShowInactivesModal(true)} variant="solid" width="80%" colorScheme="blueGray" mt={4}>
                  ADD PLAYER
                </Button>
              </Center>
            ) : null}

            {eliminatedEntries.length ? (
              <VStack mt={6} space={0}>
                <Text fontSize="10" color="blueGray.500" bold mb={1}>
                  ELIMINATED
                </Text>
                {eliminatedEntries.map((entry, index) => (
                  <HStack
                    key={entry.id}
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                    py={1}
                    backgroundColor={index % 2 === 0 ? "blueGray.900" : "transparent"}
                  >
                    <Text fontSize="xs" color="blueGray.300" flexShrink={1} isTruncated>
                      {(entry.name ?? "").toUpperCase()}
                    </Text>
                    <HStack alignItems="center" space={2}>
                      <Text fontSize="xs" color={entry.finish_position === 1 ? "teal.300" : "blueGray.300"} bold>
                        {ordinal(entry.finish_position as number)}
                      </Text>
                      {canManage && lastAction?.eliminatedId === entry.id ? (
                        <IconButton
                          size="xs"
                          variant="ghost"
                          _icon={{ as: MaterialIcons, name: "undo", size: "xs", color: "blueGray.500" }}
                          onPress={handleUndo}
                        />
                      ) : null}
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            ) : null}
          </VStack>
        </ScrollView>
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
            isDisabled={!allEliminated}
            onPress={handleEndTournament}
          >
            END TOURNAMENT
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
