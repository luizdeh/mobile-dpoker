import React, { useState, SetStateAction, Dispatch, useEffect } from "react";
import { HStack, Text, IconButton } from "native-base";
import { Entypo } from "@expo/vector-icons";
import { addRebuy } from "../utils/db/addRebuy";
import { type Player } from "../lib/types";
import RebuyDialog from "./RebuyDialog";

// TODO:
// set up modals for confirmation of adding a rebuy

interface Props {
  player: Player;
  updateActivePlayers: Dispatch<SetStateAction<Player[]>>;
}

export default function ActivePlayer({ player, updateActivePlayers }: Props) {
  const [me, setMe] = useState(player);
  const [isOpen, setIsOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleRebuy = async () => {
    // send to db
    await addRebuy(me.id);
    // update self
    const updatedMe = {
      ...me,
      quantity_rebuy: me.quantity_rebuy + 1,
      chips: me.chips + me.re_buy_value,
    };
    setMe(updatedMe);
    // update active players in parent component
    updateActivePlayers((prev: any) => {
      const idx = prev.findIndex((item: Player) => item.id === player.id);
      const newPlayers = [...prev];
      newPlayers[idx] = updatedMe;
      return newPlayers;
    });
    setIsOpen(false)
  };

  useEffect(() => {
    if (isOpen && confirm) handleRebuy()
  }, [isOpen, confirm])

  return (
    <>
      <RebuyDialog player={me.name.toUpperCase()} isOpen={isOpen} onClose={() => setIsOpen(false)} setConfirm={setConfirm} />
      <HStack
        space={6}
        justifyItems="space-between"
        alignItems="center"
        lineHeight="2xl"
      >
        <Text flex={3}>{me.name.toUpperCase()}</Text>
        <HStack flex={2} alignItems="center" justifyItems="space-between">
          <Text fontSize="md" flex={1} textAlign="center">
            {me.quantity_rebuy}
          </Text>
          <IconButton
            colorScheme="muted"
            _icon={{ as: Entypo, name: "plus" }}
            flex={1}
            onPress={() => setIsOpen(true)}
          />
        </HStack>
        <Text flex={1} textAlign="right">
          {me.chips}
        </Text>
      </HStack>
    </>
  );
}