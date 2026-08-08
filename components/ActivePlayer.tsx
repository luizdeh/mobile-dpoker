import React, { useState, SetStateAction, Dispatch, useEffect } from "react";
import { HStack, Text, IconButton } from "native-base";
import { Entypo } from "@expo/vector-icons";
import { addRebuy } from "../utils/db/addRebuy";
import { removeRebuy } from "../utils/db/removeRebuy";
import { type Player } from "../lib/types";
import RebuyDialog from "./RebuyDialog";
import useAuthContext from "../context/useAuthContext";

interface Props {
  player: Player;
  updateActivePlayers: Dispatch<SetStateAction<Player[]>>;
}

export default function ActivePlayer({ player, updateActivePlayers }: Props) {
  const { canManage } = useAuthContext();
  const [me, setMe] = useState(player);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const applyPlayerUpdate = (updatedMe: Player) => {
    setMe(updatedMe);
    updateActivePlayers((prev: any) => {
      const idx = prev.findIndex((item: Player) => item.id === player.id);
      const newPlayers = [...prev];
      newPlayers[idx] = updatedMe;
      return newPlayers;
    });
  };

  const handleRebuy = async () => {
    await addRebuy(me.id);
    applyPlayerUpdate({
      ...me,
      quantity_rebuy: me.quantity_rebuy + 1,
      chips: me.chips + me.re_buy_value,
    });
    setIsAddOpen(false);
    setConfirmAdd(false);
  };

  const handleRemoveRebuy = async () => {
    await removeRebuy(me.id);
    applyPlayerUpdate({
      ...me,
      quantity_rebuy: Math.max(me.quantity_rebuy - 1, 0),
      chips: Math.max(me.chips - me.re_buy_value, 0),
    });
    setIsRemoveOpen(false);
    setConfirmRemove(false);
  };

  useEffect(() => {
    if (isAddOpen && confirmAdd) handleRebuy()
  }, [isAddOpen, confirmAdd])

  useEffect(() => {
    if (isRemoveOpen && confirmRemove) handleRemoveRebuy()
  }, [isRemoveOpen, confirmRemove])

  return (
    <>
      <RebuyDialog
        player={me.name.toUpperCase()}
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setConfirmAdd(false);
        }}
        setConfirm={setConfirmAdd}
        mode="add"
      />
      <RebuyDialog
        player={me.name.toUpperCase()}
        isOpen={isRemoveOpen}
        onClose={() => {
          setIsRemoveOpen(false);
          setConfirmRemove(false);
        }}
        setConfirm={setConfirmRemove}
        mode="remove"
      />
      <HStack
        space={6}
        justifyItems="space-between"
        alignItems="center"
        lineHeight="2xl"
      >
        <Text flex={3}>{me.name.toUpperCase()}</Text>
        <HStack flex={2} alignItems="center" justifyItems="space-between">
          {canManage ? (
            <IconButton
              colorScheme="muted"
              _icon={{ as: Entypo, name: "minus" }}
              flex={1}
              isDisabled={me.quantity_rebuy === 0}
              onPress={() => setIsRemoveOpen(true)}
            />
          ) : null}
          <Text fontSize="md" flex={1} textAlign="center">
            {me.quantity_rebuy}
          </Text>
          {canManage ? (
            <IconButton
              colorScheme="muted"
              _icon={{ as: Entypo, name: "plus" }}
              flex={1}
              onPress={() => setIsAddOpen(true)}
            />
          ) : null}
        </HStack>
        <Text flex={1} textAlign="right">
          {me.chips}
        </Text>
      </HStack>
    </>
  );
}