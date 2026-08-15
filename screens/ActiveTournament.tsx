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
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getTournamentPlayers } from "../utils/db/getTournamentPlayers";
import { tournamentStatus } from "../utils/db/tournamentStatus";
import { addPlayerToTournament } from "../utils/db/addPlayerToTournament";
import { addTournamentRebuy } from "../utils/db/addTournamentRebuy";
import { eliminatePlayer } from "../utils/db/eliminatePlayer";
import { undoEliminatePlayer } from "../utils/db/undoEliminatePlayer";
import { removePlayerFromTournament } from "../utils/db/removePlayerFromTournament";
import { TournamentPlayer, PlayerList, TournamentParamsNavigation } from "../lib/types";
import { ordinal } from "../lib/ordinal";
import useAuthContext from "../context/useAuthContext";
import TournamentRebuyDialog from "../components/TournamentRebuyDialog";
import RemoveTournamentEntryDialog from "../components/RemoveTournamentEntryDialog";

// Placeholder cutoff until live blind-level tracking exists: once 6th place
// has been decided (5 players left), it's too late for a new entrant to
// realistically catch up, so late entries are cut off here.
const LATE_ENTRY_CUTOFF_POSITION = 6;

export default function ActiveTournament() {
  const { canManage } = useAuthContext();

  const route = useRoute<RouteProp<TournamentParamsNavigation, "ActiveTournament">>();
  const tournament = route.params.tournament;
  const players = route.params.players;
  const inactive = players.filter((item: PlayerList) => item.active === false);

  const [entries, setEntries] = useState<TournamentPlayer[]>([]);
  const [inactivePlayers, setInactivePlayers] = useState<{ id: number; name: string }[]>(inactive);
  const [addNewPlayers, setAddNewPlayers] = useState<[] | number[]>([]);
  const [showInactivesModal, setShowInactivesModal] = useState(false);
  const [rebuyTarget, setRebuyTarget] = useState<TournamentPlayer | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TournamentPlayer | null>(null);

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
  // Ascending by finish_position (champion first) — since eliminations
  // assign positions in decreasing order over time, the smallest
  // finish_position among the eliminated is always the most recent one, so
  // eliminatedEntries[0] is always "undo-able" back to the very first
  // elimination, one step at a time.
  const eliminatedEntries = [...entries]
    .filter((entry) => entry.finish_position != null)
    .sort((a, b) => (a.finish_position as number) - (b.finish_position as number));

  const lateEntryCutoffReached = entries.some(
    (entry) => entry.finish_position != null && entry.finish_position <= LATE_ENTRY_CUTOFF_POSITION
  );

  const handleConfirmRebuy = async () => {
    if (!rebuyTarget) return;
    const entry = rebuyTarget;
    setEntries((prev) => prev.map((item) => (item.id === entry.id ? { ...item, quantity_rebuy: 1 } : item)));
    setRebuyTarget(null);
    const result: any = await addTournamentRebuy(entry.id);
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

    await eliminatePlayer(entry.id, position);
    if (champion) await eliminatePlayer(champion.id, 1);
  };

  const handleUndoLast = async () => {
    if (!eliminatedEntries.length) return;
    const target = eliminatedEntries[0];
    setEntries((prev) => prev.map((item) => (item.id === target.id ? { ...item, finish_position: null } : item)));
    await undoEliminatePlayer(target.id);
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

  const handleConfirmRemoveEntry = async () => {
    if (!removeTarget) return;
    const entry = removeTarget;
    const success = await removePlayerFromTournament(entry.id);
    setRemoveTarget(null);
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
      <Box flex={1} p={6} pb={3}>
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <VStack flex={1}>
            <Text fontSize="10" color="blueGray.400" bold mb={1}>
              STILL PLAYING ({activeEntries.length})
            </Text>
            <Divider mb="2" backgroundColor="blueGray.800" />
            <VStack w="100%" space={0}>
              {activeEntries.map((entry: TournamentPlayer, index: number) => (
                <HStack
                  key={entry.id}
                  justifyContent="space-between"
                  alignItems="center"
                  px={2}
                  py={2}
                  backgroundColor={index % 2 === 0 ? "blueGray.900" : "transparent"}
                >
                  <VStack flex={1}>
                    <Text color="white" fontSize="sm" isTruncated>
                      {(entry.name ?? "").toUpperCase()}
                    </Text>
                    {entry.quantity_rebuy > 0 ? (
                      <Text color="blueGray.400" fontSize="10">
                        1 REBUY
                      </Text>
                    ) : null}
                  </VStack>
                  {canManage ? (
                    <HStack alignItems="center" space={2}>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        _icon={{ as: MaterialIcons, name: "close", size: "sm", color: "blueGray.600" }}
                        onPress={() => setRemoveTarget(entry)}
                      />
                      {entry.quantity_rebuy === 0 ? (
                        <Button size="sm" variant="outline" colorScheme="teal" onPress={() => setRebuyTarget(entry)}>
                          REBUY
                        </Button>
                      ) : null}
                      <Button size="sm" variant="solid" colorScheme="rose" onPress={() => handleEliminate(entry)}>
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
                <Button
                  onPress={() => setShowInactivesModal(true)}
                  variant="solid"
                  width="80%"
                  colorScheme="blueGray"
                  mt={4}
                  isDisabled={lateEntryCutoffReached || allEliminated}
                >
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
                      {canManage && index === 0 ? (
                        <IconButton
                          size="xs"
                          variant="ghost"
                          _icon={{ as: MaterialIcons, name: "undo", size: "xs", color: "blueGray.500" }}
                          onPress={handleUndoLast}
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
      <TournamentRebuyDialog
        player={(rebuyTarget?.name ?? "").toUpperCase()}
        isOpen={!!rebuyTarget}
        onClose={() => setRebuyTarget(null)}
        onConfirm={handleConfirmRebuy}
      />
      <RemoveTournamentEntryDialog
        player={(removeTarget?.name ?? "").toUpperCase()}
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleConfirmRemoveEntry}
      />
    </Box>
  );
}
