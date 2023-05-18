import React, { Dispatch, SetStateAction } from "react";
import { Text, HStack, Checkbox } from "native-base";

interface Props {
  player: any;
  updateCheckboxes: Dispatch<SetStateAction<any[]>>;
}

export default function PlayersCheckboxes({ player, updateCheckboxes }: Props) {
  const handleChange = () => {
    updateCheckboxes((prev) => {
      const temp = [...prev];
      const idx = temp.findIndex((item: any) => item.id === player.id);
      temp[idx].checkbox = !temp[idx].checkbox;
      return temp;
    });
  };

  return (
    <HStack
      key={player.id}
      alignItems="center"
      p={1}
      borderColor="tertiary.400"
      borderWidth="1"
      borderRadius="lg"
      m={0.5}
      alignSelf="flex-start"
      minW="48%"
    >
      <Text flex={1} fontSize="xs">
        {player.name.toUpperCase()}
      </Text>
      <Checkbox
        colorScheme="tertiary"
        size="sm"
        isChecked={player.checkbox}
        value={player.checkbox ? "checked" : "unchecked"}
        onChange={handleChange}
      />
    </HStack>
  );
}
