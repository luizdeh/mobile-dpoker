import React, { useState } from "react";
import { Text, Center, Box, VStack, HStack, Input, Button, Divider, Pressable, Icon } from "native-base";
import { AntDesign } from "@expo/vector-icons";
import useAuthContext from "../context/useAuthContext";
import useGamesContext from "../context/useGamesContext";
import { deleteGame } from "../utils/db/deleteGame";
import DeleteGameDialog from "../components/DeleteGameDialog";

export default function Profile({ navigation }: { navigation: any }) {
  const { session, role, canManage, signIn, signOut, changePassword } = useAuthContext();
  const { games, gamePlayers, players, setGames, setGamePlayers } = useGamesContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

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

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    setChangingPassword(true);
    const { error } = await changePassword(newPassword);
    setChangingPassword(false);
    if (error) {
      setPasswordError(error);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
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
      <Box flex={1} px={8} pt={6} pb={8} justifyContent="space-between">
        <VStack space={4} alignItems="center" w="100%">
          <VStack alignItems="center" space={0}>
            <Text fontSize="md">{session.user.email}</Text>
            <Text fontSize="xs" color="blueGray.400">{role?.toUpperCase() ?? "NO ROLE ASSIGNED"}</Text>
          </VStack>

          {role === "admin" ? (
            <Button
              onPress={() => navigation.navigate("Operators")}
              colorScheme="blueGray"
              width="80%"
            >
              MANAGE OPERATORS
            </Button>
          ) : null}

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

          <Divider my={2} />
          <Pressable onPress={() => setShowPasswordForm((v) => !v)} width="100%">
            <HStack justifyContent="center" alignItems="center" space={1}>
              <Text fontSize="xs" color="blueGray.400" letterSpacing="sm">CHANGE PASSWORD</Text>
              <Icon as={AntDesign} name={showPasswordForm ? "up" : "down"} size="2xs" color="blueGray.400" />
            </HStack>
          </Pressable>
          {showPasswordForm ? (
            <VStack space={3} w="100%" alignItems="center">
              <Input
                placeholder="new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                backgroundColor="white"
                width="100%"
              />
              <Input
                placeholder="confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                backgroundColor="white"
                width="100%"
              />
              {passwordError ? <Text color="red.400" fontSize="xs">{passwordError}</Text> : null}
              {passwordSuccess ? <Text color="emerald.400" fontSize="xs">Password updated.</Text> : null}
              <Button
                onPress={handleChangePassword}
                isDisabled={!newPassword.length || !confirmPassword.length || changingPassword}
                colorScheme="blueGray"
                width="60%"
              >
                {changingPassword ? "UPDATING..." : "UPDATE PASSWORD"}
              </Button>
            </VStack>
          ) : null}
        </VStack>

        <Button
          onPress={handleSignOut}
          variant="outline"
          borderColor="blueGray.800"
          backgroundColor="blueGray.900"
          _text={{ color: "blueGray.400" }}
          _pressed={{ backgroundColor: "blueGray.800" }}
          width="60%"
          alignSelf="center"
        >
          SIGN OUT
        </Button>
      </Box>
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
