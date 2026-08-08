import React, { useState } from "react";
import { Text, Center, VStack, Input, Button, Divider } from "native-base";
import useAuthContext from "../context/useAuthContext";
import useGamesContext from "../context/useGamesContext";
import { deleteGame } from "../utils/db/deleteGame";
import DeleteGameDialog from "../components/DeleteGameDialog";

export default function Profile({ navigation }: { navigation: any }) {
  const { session, role, canManage, signIn, signOut } = useAuthContext();
  const { games, gamePlayers, players, setGames, setGamePlayers } = useGamesContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleSignIn = async () => {
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
    } else {
      navigation.navigate("Home");
    }
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigation.navigate("Home");
  };

  const lastGame = games?.length
    ? [...games].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const lastGamePlayers = lastGame
    ? (gamePlayers ?? [])
      .filter((gp: any) => gp.game_id === lastGame.id)
      .map((gp: any) => ({
        ...gp,
        name: players?.find((p: any) => p.id === gp.person_id)?.name ?? "Unknown",
      }))
    : [];

  const handleDeleteLastGame = async () => {
    if (!lastGame) return;
    setIsDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(false);
    const success = await deleteGame(lastGame.id);
    setIsDeleting(false);
    if (!success) {
      setDeleteError("Failed to delete game. Please try again.");
      return;
    }
    setGames?.((games ?? []).filter((g: any) => g.id !== lastGame.id));
    setGamePlayers?.((gamePlayers ?? []).filter((gp: any) => gp.game_id !== lastGame.id));
    setDeleteDialogOpen(false);
    setDeleteSuccess(true);
  };

  if (session) {
    return (
      <Center flex={1} px={8}>
        <VStack space={4} alignItems="center" w="100%">
          <Text fontSize="md">{session.user.email}</Text>
          <Text fontSize="xs" color="blueGray.400">{role?.toUpperCase() ?? "NO ROLE ASSIGNED"}</Text>
          <Button onPress={handleSignOut} colorScheme="blueGray" width="60%">
            SIGN OUT
          </Button>

          {canManage ? (
            <>
              <Divider my={2} />
              <Text fontSize="xs" color="blueGray.400">ADMIN</Text>
              <Button
                onPress={() => {
                  setDeleteError(null);
                  setDeleteSuccess(false);
                  setDeleteDialogOpen(true);
                }}
                colorScheme="danger"
                variant="outline"
                width="80%"
                isDisabled={!lastGame}
              >
                DELETE LAST GAME PLAYED
              </Button>
              {deleteError ? <Text color="red.400" fontSize="xs">{deleteError}</Text> : null}
              {deleteSuccess ? <Text color="emerald.400" fontSize="xs">Game deleted successfully.</Text> : null}
              {lastGame ? (
                <DeleteGameDialog
                  game={lastGame}
                  players={lastGamePlayers}
                  isOpen={deleteDialogOpen}
                  onClose={() => setDeleteDialogOpen(false)}
                  onConfirm={handleDeleteLastGame}
                  isDeleting={isDeleting}
                />
              ) : null}
            </>
          ) : null}
        </VStack>
      </Center>
    );
  }

  return (
    <Center flex={1} px={8}>
      <VStack space={4} w="100%">
        <Input
          placeholder="email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          backgroundColor="white"
        />
        <Input
          placeholder="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          backgroundColor="white"
        />
        {error ? <Text color="red.400">{error}</Text> : null}
        <Button
          onPress={handleSignIn}
          isDisabled={!email.length || !password.length || submitting}
          colorScheme="blueGray"
        >
          SIGN IN
        </Button>
      </VStack>
    </Center>
  );
}
