import { MaterialIcons } from "@expo/vector-icons";
import { Box, HStack, IconButton, Text, VStack } from "native-base";
import React, { useState } from "react";
import { TextInput } from "react-native";
import { type PlayerWithGames } from "../lib/types";
import { updatePlayer } from "../utils/db/updatePlayer";
import { deletePlayer } from "../utils/db/deletePlayer";
import useAuthContext from "../context/useAuthContext";
import DeletePlayerDialog from "./DeletePlayerDialog";


type RegisteredPlayerProps = {
  player: PlayerWithGames;
  idx: number;
  onDeleted: (id: number) => void;
}

export default function RegisteredPlayer({ player, idx, onDeleted }: RegisteredPlayerProps) {

  const { canManage, role } = useAuthContext();
  const [me, setMe] = useState(player);
  const [enableEdit, setEnableEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const editName = () => setEnableEdit((state) => !state);

  const handleChange = (e: any) => setMe({ ...me, name: e.target.value });

  const handleCancelEdit = () => {
    setMe(player);
    editName();
  };

  const handleSave = async () => {
    if (player.name !== me.name) {
      await updatePlayer(me.id, me.name);
      editName();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    const { success, error } = await deletePlayer(me.id);
    setIsDeleting(false);
    if (!success) {
      setDeleteError(error ?? "Failed to delete player. Please try again.");
      return;
    }
    setDeleteDialogOpen(false);
    onDeleted(me.id);
  };

  const oddOrEven = (index: number) => index % 2 === 0

  // useEffect(() => {
  //   if (me.id === 9) {
  //     console.log(games)
  //   }
  // }, [])

  return (
    <VStack w="100%">
      <HStack
        alignItems="center"
        justifyContent="space-between"
        height="12"
        flex={1}
        w="100%"
        bgColor={oddOrEven(idx) ? 'tertiary.100' : 'tertiary.50'}
        borderRadius="lg"
        px={2}
      >
        <Box flex={5}>
          <TextInput
            style={{ borderWidth: 0, padding: 4 }}
            value={me.name.toUpperCase()}
            onChange={handleChange}
            editable={enableEdit}
          />
        </Box>
        <Text flex={1} fontSize="xs">
          GP: {player?.games_played}
        </Text>
        {canManage ? (
          <IconButton
            flex={1}
            colorScheme="tertiary"
            _icon={
              enableEdit
                ? {
                  as: MaterialIcons,
                  name: "save",
                  size: "xl",
                }
                : {
                  as: MaterialIcons,
                  name: "edit",
                  size: "xl",
                }
            }
            onPress={() => (enableEdit ? handleSave() : editName())}
          />
        ) : null}
        {canManage && enableEdit ? (
          <IconButton
            flex={1}
            colorScheme="tertiary"
            _icon={{
              as: MaterialIcons,
              name: "cancel",
              size: "xl",
            }}
            onPress={handleCancelEdit}
          />
        ) : null}
        {role === "admin" ? (
          <IconButton
            flex={1}
            colorScheme="danger"
            isDisabled={!!player.hasGameRecord}
            _icon={{
              as: MaterialIcons,
              name: "delete",
              size: "xl",
            }}
            onPress={() => setDeleteDialogOpen(true)}
          />
        ) : null}
      </HStack>
      {deleteError ? (
        <Text color="red.400" fontSize="xs" textAlign="center" mt={1}>{deleteError}</Text>
      ) : null}
      <DeletePlayerDialog
        playerName={me.name.toUpperCase()}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </VStack>
  );
}