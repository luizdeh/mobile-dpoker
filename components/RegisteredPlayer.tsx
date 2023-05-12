import React, { Dispatch, SetStateAction, useState } from "react";
import { Text, Box, IconButton, HStack } from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { PlayerList } from "../lib/types";
import { updatePlayer } from "../utils/updatePlayer";
import { getPlayers } from "../utils/fetchPlayers";

interface Prop {
  player: PlayerList;
  updatePlayers: Dispatch<SetStateAction<PlayerList[]>>;
}

export default function RegisteredPlayer({ player, updatePlayers }: Prop) {
  const [me, setMe] = useState(player);
  const [enableEdit, setEnableEdit] = useState(false);

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
    const msg = confirm(`you are about to delete ${me.name}`);
    if (msg) {
      // delete the player

      // update the parent component
      const players = await getPlayers();
      if (players) updatePlayers(players);
    }
  };

  return (
    <HStack
      alignItems="center"
      justifyContent="space-between"
      height="12"
      flex={1}
      w="100%"
      bgColor="tertiary.100"
      borderRadius="lg"
      px={2}
    >
      <Text flex={1}>{me.id}.</Text>
      <Box flex={5}>
        <TextInput
          style={{ borderWidth: 0, padding: 4 }}
          value={me.name.toUpperCase()}
          onChange={handleChange}
          editable={enableEdit}
        />
      </Box>
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
      {enableEdit ? (
        <IconButton
          flex={1}
          colorScheme="tertiary"
          _icon={{
            as: MaterialIcons,
            name: "cancel",
            size: "xl",
          }}
          onPress={() => (enableEdit ? handleCancelEdit() : handleDelete())}
        />
      ) : null}
    </HStack>
  );
}
