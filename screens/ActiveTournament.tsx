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
  Pressable,
  Icon,
} from "native-base";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getTournamentPlayers } from "../utils/db/getTournamentPlayers";
import { tournamentStatus } from "../utils/db/tournamentStatus";
import { addPlayerToTournament } from "../utils/db/addPlayerToTournament";
import { addTournamentRebuy } from "../utils/db/addTournamentRebuy";
import { eliminatePlayer } from "../utils/db/eliminatePlayer";
import { undoEliminatePlayer } from "../utils/db/undoEliminatePlayer";
import { removePlayerFromTournament } from "../utils/db/removePlayerFromTournament";
import { lockTournamentEntries } from "../utils/db/lockTournamentEntries";
import { TournamentPlayer, PlayerList, TournamentParamsNavigation } from "../lib/types";
import { ordinal } from "../lib/ordinal";
import useAuthContext from "../context/useAuthContext";
import TournamentRebuyDialog from "../components/TournamentRebuyDialog";
import RemoveTournamentEntryDialog from "../components/RemoveTournamentEntryDialog";
import EliminatePlayerDialog from "../components/EliminatePlayerDialog";
import DisableEntriesDialog from "../components/DisableEntriesDialog";

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
  const [eliminateTarget, setEliminateTarget] = useState<TournamentPlayer | null>(null);
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null);
  const [entriesLocked, setEntriesLocked] = useState<boolean>(!!tournament.entries_locked);
  const [showDisableEntriesConfirm, setShowDisableEntriesConfirm] = useState(false);
  const [isLockingEntries, setIsLockingEntries] = useState(false);

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

  const handleConfirmDisableEntries = async () => {
    setIsLockingEntries(true);
    await lockTournamentEntries(tournament.id);
    setEntriesLocked(true);
    setIsLockingEntries(false);
    setShowDisableEntriesConfirm(false);
  };

  const handleConfirmRebuy = async () => {
    if (!rebuyTarget) return;
    const entry = rebuyTarget;
    setEntries((prev) => prev.map((item) => (item.id === entry.id ? { ...item, quantity_rebuy: 1 } : item)));
    setRebuyTarget(null);
    setExpandedEntryId((prev) => (prev === entry.id ? null : prev));
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

  const handleConfirmEliminate = async () => {
    if (!eliminateTarget) return;
    const entry = eliminateTarget;
    setEliminateTarget(null);
    await handleEliminate(entry);
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

  const displayEntries = [...activeEntries, ...eliminatedEntries];

  return (
    <Box backgroundColor="black" h="100%" w="100%">
      {renderInactivesModal()}
      <Box flex={1} p={6} pb={3}>
        <ScrollView flex={1} showsVerticalScrollIndicator={false}>
          <VStack flex={1}>
            <HStack justifyContent="space-between" alignItems="center" mb={2}>
              {canManage ? (
                <Button
                  onPress={() => setShowInactivesModal(true)}
                  variant="solid"
                  size="sm"
                  bg="blueGray.900"
                  _pressed={{ bg: "blueGray.800" }}
                  _text={{ fontSize: 10, color: "emerald.400" }}
                  isDisabled={entriesLocked || allEliminated}
                >
                  ADD PLAYER
                </Button>
              ) : (
                <Box />
              )}
              <HStack alignItems="center" space={5}>
                {canManage ? (
                  <IconButton
                    size="md"
                    variant="ghost"
                    isDisabled={entriesLocked}
                    onPress={() => setShowDisableEntriesConfirm(true)}
                    _icon={{
                      as: MaterialIcons,
                      name: entriesLocked ? "lock" : "access-alarm",
                      size: "md",
                      color: entriesLocked ? "blueGray.700" : "blueGray.400",
                    }}
                  />
                ) : null}
                <Text fontSize="2xl" bold>
                  <Text color="emerald.400">{activeEntries.length}</Text>
                  <Text color="white"> / </Text>
                  <Text color="teal.400">{entries.length}</Text>
                </Text>
              </HStack>
            </HStack>
            <Divider mb="2" backgroundColor="blueGray.800" />
            <VStack w="100%" space={2}>
              {displayEntries.map((entry: TournamentPlayer) => {
                const isEliminated = entry.finish_position != null;
                const isChampion = entry.finish_position === 1;
                const isMostRecentEliminated = isEliminated && eliminatedEntries[0]?.id === entry.id;
                const isExpanded = expandedEntryId === entry.id;
                const canRebuy = entry.quantity_rebuy === 0 && !entriesLocked;
                const canExpand = canManage && (!isEliminated || isMostRecentEliminated);
                return (
                  <VStack
                    key={entry.id}
                    backgroundColor="blueGray.800"
                    borderRadius="sm"
                    overflow="hidden"
                    opacity={isEliminated && !isChampion ? 0.55 : 1}
                  >
                    <Pressable
                      onPress={() =>
                        canExpand && setExpandedEntryId((prev) => (prev === entry.id ? null : entry.id))
                      }
                    >
                      <HStack justifyContent="space-between" alignItems="center" px={3} py={3}>
                        <Text color="white" fontSize="sm" isTruncated flex={1}>
                          {(entry.name ?? "").toUpperCase()}
                        </Text>
                        {isChampion ? (
                          <Box flex={1} alignItems="center">
                            <Icon as={MaterialIcons} name="emoji-events" size="md" color="amber.400" />
                          </Box>
                        ) : null}
                        <HStack alignItems="center" space={2} flex={isChampion ? 1 : undefined} justifyContent="flex-end">
                          {isEliminated ? (
                            <Text color={isChampion ? "amber.400" : "blueGray.300"} fontSize="xs" bold>
                              {ordinal(entry.finish_position as number)}
                            </Text>
                          ) : null}
                          <Box
                            borderWidth={1.5}
                            borderColor="teal.400"
                            borderRadius="full"
                            w={3}
                            h={3}
                            backgroundColor={entry.quantity_rebuy > 0 ? "teal.400" : "transparent"}
                          />
                        </HStack>
                      </HStack>
                    </Pressable>
                    {isExpanded && canManage && !isEliminated ? (
                      <HStack
                        justifyContent="space-evenly"
                        alignItems="center"
                        px={3}
                        pb={2}
                        pt={2}
                        borderTopWidth={1}
                        borderColor="blueGray.700"
                      >
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="blueGray"
                          _icon={{ as: AntDesign, name: "delete", size: "sm", color: "blueGray.500" }}
                          onPress={() => setRemoveTarget(entry)}
                        />
                        <Button
                          size="sm"
                          variant="subtle"
                          colorScheme="rose"
                          py={1}
                          width="100px"
                          onPress={() => setEliminateTarget(entry)}
                        >
                          ELIMINATE
                        </Button>
                        <Button
                          size="sm"
                          variant="solid"
                          colorScheme="teal"
                          py={1}
                          width="100px"
                          isDisabled={!canRebuy}
                          onPress={() => setRebuyTarget(entry)}
                        >
                          RE-BUY
                        </Button>
                      </HStack>
                    ) : null}
                    {isExpanded && canManage && isMostRecentEliminated ? (
                      <HStack
                        justifyContent="center"
                        alignItems="center"
                        px={3}
                        pb={2}
                        pt={2}
                        borderTopWidth={1}
                        borderColor="blueGray.700"
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blueGray"
                          leftIcon={<Icon as={MaterialIcons} name="undo" size="xs" color="blueGray.400" />}
                          _text={{ color: "blueGray.400" }}
                          onPress={handleUndoLast}
                        >
                          UNDO
                        </Button>
                      </HStack>
                    ) : null}
                  </VStack>
                );
              })}
              {!displayEntries.length ? (
                <Text color="blueGray.400" fontSize="xs" textAlign="center" mt={2}>
                  No players registered yet.
                </Text>
              ) : null}
            </VStack>
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
      <EliminatePlayerDialog
        player={(eliminateTarget?.name ?? "").toUpperCase()}
        isOpen={!!eliminateTarget}
        onClose={() => setEliminateTarget(null)}
        onConfirm={handleConfirmEliminate}
      />
      <DisableEntriesDialog
        isOpen={showDisableEntriesConfirm}
        onClose={() => !isLockingEntries && setShowDisableEntriesConfirm(false)}
        onConfirm={handleConfirmDisableEntries}
      />
    </Box>
  );
}
