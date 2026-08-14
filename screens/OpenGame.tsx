import React, { useEffect, useState } from "react";
import { Box, Center, VStack, Text, Button, Divider, ScrollView, Spinner } from "native-base";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { GameParamsNavigation } from "../lib/types";
import { formatDateBR } from "../lib/formatDate";
import useGamesContext from "../context/useGamesContext";
import { getGamePlayers } from "../utils/db/getGamePlayers";
import { deleteGame } from "../utils/db/deleteGame";
import { claimGameLock } from "../utils/db/claimGameLock";
import { forceClaimGameLock } from "../utils/db/forceClaimGameLock";
import { getDeviceId } from "../lib/deviceId";
import useAuthContext from "../context/useAuthContext";
import DeleteGameDialog from "../components/DeleteGameDialog";
import ResumeGameDialog from "../components/ResumeGameDialog";

export default function OpenGame() {
  const route = useRoute<RouteProp<GameParamsNavigation, "OpenGame">>();
  const navigation = useNavigation<any>();
  const { players, gamePlayers, setGamePlayers } = useGamesContext();
  const { session, role } = useAuthContext();

  const game = route.params.game;

  const [openGamePlayers, setOpenGamePlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [lockError, setLockError] = useState<string | null>(null);
  const [isResuming, setIsResuming] = useState(false);

  useEffect(() => {
    (async () => {
      const all = await getGamePlayers();
      const filtered = all
        .filter((gp: any) => gp.game_id === game.id)
        .map((gp: any) => ({
          ...gp,
          name: players?.find((p: any) => p.id === gp.person_id)?.name ?? "Unknown",
        }));
      setOpenGamePlayers(filtered);
      setIsLoading(false);
    })();
    getDeviceId().then(setDeviceId);
  }, []);

  const isLockedByOther = !!game.locked_by && !!deviceId && game.locked_by !== deviceId;
  const canTakeOver = role === "admin" || (!!session && session.user.id === game.created_by);

  const handleResume = async (force = false) => {
    setIsResuming(true);
    setLockError(null);
    const claimed = force
      ? await forceClaimGameLock(game.id, deviceId!)
      : await claimGameLock(game.id, deviceId!);
    setIsResuming(false);
    if (!claimed) {
      setLockError("This game is currently open on another device.");
      setResumeDialogOpen(false);
      return;
    }
    const annotatedPlayers = (players ?? []).map((p: any) => ({
      ...p,
      active: openGamePlayers.some((gp: any) => gp.person_id === p.id),
    }));
    setResumeDialogOpen(false);
    navigation.navigate("ActiveGame", { game: claimed, players: annotatedPlayers });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    const success = await deleteGame(game.id);
    setIsDeleting(false);
    if (!success) {
      setDeleteError("Failed to delete game. Please try again.");
      return;
    }
    setGamePlayers?.((gamePlayers ?? []).filter((gp: any) => gp.game_id !== game.id));
    setDeleteDialogOpen(false);
    navigation.navigate("Home");
  };

  return (
    <Box flex={1} backgroundColor="black" px={6} py={4}>
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.600" />
        </Center>
      ) : (
        <ScrollView>
          <VStack space={3}>
            <Text color="white" fontSize="lg" bold textAlign="center">
              OPEN GAME FOUND
            </Text>
            <Text color="blueGray.300" fontSize="xs" textAlign="center">
              This game was started but never finished.
            </Text>
            <Divider my={2} />
            <Text color="white" bold>Game #{game.id} — {formatDateBR(game.date)}</Text>
            <Text color="blueGray.300" fontSize="xs">Status: {game.status}</Text>
            <Text color="blueGray.300" fontSize="xs">
              Buy-in: {game.buy_in_value} | Re-buy: {game.re_buy_value} | Chip value: {game.chip_value}
            </Text>
            <Text color="white" bold fontSize="xs" mt={2}>
              Players ({openGamePlayers.length}):
            </Text>
            {openGamePlayers.map((p: any) => (
              <Text key={p.id} color="blueGray.300" fontSize="xs">
                {p.name.toUpperCase()} — {p.quantity_rebuy} rebuys
              </Text>
            ))}
            {isLockedByOther ? (
              <Text color="amber.400" fontSize="xs" textAlign="center" mt={2}>
                This game is currently open on another device.
              </Text>
            ) : null}
            <Divider my={4} />
            <Button colorScheme="emerald" isLoading={isResuming} onPress={() => setResumeDialogOpen(true)}>
              RESUME GAME
            </Button>
            <Button colorScheme="danger" variant="outline" onPress={() => setDeleteDialogOpen(true)}>
              DELETE GAME
            </Button>
            {lockError ? (
              <VStack space={2} mt={2}>
                <Text color="red.400" fontSize="xs" textAlign="center">{lockError}</Text>
                {canTakeOver ? (
                  <Button colorScheme="orange" variant="outline" onPress={() => handleResume(true)}>
                    TAKE OVER ANYWAY
                  </Button>
                ) : (
                  <Text color="blueGray.400" fontSize="xs" textAlign="center">
                    Only the admin or the player who opened this game can take it over.
                  </Text>
                )}
              </VStack>
            ) : null}
            {deleteError ? (
              <Text color="red.400" fontSize="xs" textAlign="center">{deleteError}</Text>
            ) : null}
          </VStack>
        </ScrollView>
      )}
      <DeleteGameDialog
        game={game}
        players={openGamePlayers}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
      <ResumeGameDialog
        isOpen={resumeDialogOpen}
        onClose={() => setResumeDialogOpen(false)}
        onConfirm={handleResume}
      />
    </Box>
  );
}
