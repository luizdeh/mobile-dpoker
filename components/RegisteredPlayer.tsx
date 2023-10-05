import { MaterialIcons } from "@expo/vector-icons";
import { Box, HStack, IconButton, Text } from "native-base";
import React, { useState } from "react";
import { TextInput } from "react-native";
import { type PlayerWithGames } from "../lib/types";
import { updatePlayer } from "../utils/db/updatePlayer";


type RegisteredPlayerProps = {
  player: PlayerWithGames;
  idx: number;
}

export default function RegisteredPlayer({ player, idx }: RegisteredPlayerProps) {

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

  const oddOrEven = (index: number) => index % 2 === 0

  // useEffect(() => {
  //   if (me.id === 9) {
  //     console.log(games)
  //   }
  // }, [])

  return (
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
          onPress={handleCancelEdit}
        />
      ) : null}
    </HStack>
  );
}