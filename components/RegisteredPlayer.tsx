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

  return (
    <VStack w="100%">
      <HStack
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        backgroundColor={oddOrEven(idx) ? 'blueGray.900' : 'transparent'}
        px={2}
        py={2}
      >
        <Box flex={1}>
          <TextInput
            style={{
              borderWidth: 0,
              padding: 4,
              color: 'white',
              fontSize: 14,
              backgroundColor: enableEdit ? '#1e293b' : 'transparent',
              borderRadius: 4,
            }}
            value={me.name.toUpperCase()}
            onChange={handleChange}
            editable={enableEdit}
          />
        </Box>
        <Text color="blueGray.400" fontSize="xs" mr={2}>
          GP: {player?.games_played}
        </Text>
        {canManage ? (
          <IconButton
            size="sm"
            variant="ghost"
            _icon={
              enableEdit
                ? {
                  as: MaterialIcons,
                  name: "save",
                  size: "md",
                  color: "teal.400",
                }
                : {
                  as: MaterialIcons,
                  name: "edit",
                  size: "md",
                  color: "blueGray.400",
                }
            }
            onPress={() => (enableEdit ? handleSave() : editName())}
          />
        ) : null}
        {canManage && enableEdit ? (
          <IconButton
            size="sm"
            variant="ghost"
            _icon={{
              as: MaterialIcons,
              name: "cancel",
              size: "md",
              color: "blueGray.400",
            }}
            onPress={handleCancelEdit}
          />
        ) : null}
        {role === "admin" ? (
          <IconButton
            size="sm"
            variant="ghost"
            isDisabled={!!player.hasGameRecord}
            _icon={{
              as: MaterialIcons,
              name: "delete",
              size: "md",
              color: player.hasGameRecord ? "blueGray.700" : "rose.400",
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