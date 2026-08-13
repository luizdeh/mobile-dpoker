import React, { useState, SetStateAction, Dispatch, useEffect } from "react";
import { HStack, VStack, Text, IconButton, Icon, Pressable, Box, Input } from "native-base";
import { Entypo, AntDesign } from "@expo/vector-icons";
import { addRebuy } from "../utils/db/addRebuy";
import { removeRebuy } from "../utils/db/removeRebuy";
import { type Player } from "../lib/types";
import RebuyDialog from "./RebuyDialog";
import RemovePlayerDialog from "./RemovePlayerDialog";
import useAuthContext from "../context/useAuthContext";

interface Props {
  player: Player;
  updateActivePlayers: Dispatch<SetStateAction<Player[]>>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onChipChange: (id: number, value: string) => void;
  onRemove: (player: Player) => void;
}

export default function ActivePlayer({
  player,
  updateActivePlayers,
  isExpanded,
  onToggleExpand,
  onChipChange,
  onRemove,
}: Props) {
  const { canManage } = useAuthContext();
  const canRemovePlayer = player.quantity_rebuy === 0 && !player.chips_counted;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [confirmAdd, setConfirmAdd] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isRemovePlayerOpen, setIsRemovePlayerOpen] = useState(false);

  const applyRebuyUpdate = (quantity_rebuy: number, chips: number) => {
    updateActivePlayers((prev: Player[]) =>
      prev.map((item) =>
        item.id === player.id ? { ...item, quantity_rebuy, chips } : item
      )
    );
  };

  const handleRebuy = async () => {
    await addRebuy(player.id);
    applyRebuyUpdate(player.quantity_rebuy + 1, player.chips + player.re_buy_value);
    setIsAddOpen(false);
    setConfirmAdd(false);
  };

  const handleRemoveRebuy = async () => {
    await removeRebuy(player.id);
    applyRebuyUpdate(
      Math.max(player.quantity_rebuy - 1, 0),
      Math.max(player.chips - player.re_buy_value, 0)
    );
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
        player={player.name.toUpperCase()}
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setConfirmAdd(false);
        }}
        setConfirm={setConfirmAdd}
        mode="add"
      />
      <RebuyDialog
        player={player.name.toUpperCase()}
        isOpen={isRemoveOpen}
        onClose={() => {
          setIsRemoveOpen(false);
          setConfirmRemove(false);
        }}
        setConfirm={setConfirmRemove}
        mode="remove"
      />
      <RemovePlayerDialog
        player={player.name.toUpperCase()}
        isOpen={isRemovePlayerOpen}
        onClose={() => setIsRemovePlayerOpen(false)}
        onConfirm={() => {
          setIsRemovePlayerOpen(false);
          onRemove(player);
        }}
      />
      <VStack backgroundColor="blueGray.800" borderRadius="sm" overflow="hidden">
        <Pressable onPress={onToggleExpand}>
          <HStack space={3} alignItems="center" px={3} py={3}>
            <Text flex={3} color="white" fontSize="sm" isTruncated>{player.name.toUpperCase()}</Text>
            <Text flex={2} textAlign="center" color="teal.300">
              {player.quantity_rebuy}
            </Text>
            <Box flex={1} alignItems="flex-end">
              <Icon
                as={AntDesign}
                name={player.chips_counted ? "checkcircle" : "checkcircleo"}
                size="sm"
                color={player.chips_counted ? "teal.300" : "blueGray.600"}
              />
            </Box>
          </HStack>
        </Pressable>
        {isExpanded ? (
          <VStack px={3} pb={3} pt={1} space={4} borderTopWidth={1} borderColor="blueGray.700">
            <HStack alignItems="center" justifyContent="space-between">
              {canManage ? (
                <IconButton
                  size="md"
                  variant="ghost"
                  colorScheme="blueGray"
                  _icon={{
                    as: AntDesign,
                    name: "delete",
                    size: "sm",
                    color: canRemovePlayer ? "blueGray.500" : "blueGray.700",
                  }}
                  isDisabled={!canRemovePlayer}
                  onPress={() => setIsRemovePlayerOpen(true)}
                />
              ) : (
                <Box w={10} />
              )}
              <HStack alignItems="center" space={3}>
                {canManage ? (
                  <IconButton
                    size="sm"
                    variant="solid"
                    colorScheme="blueGray"
                    borderRadius="md"
                    _icon={{ as: Entypo, name: "minus", color: "white" }}
                    isDisabled={player.quantity_rebuy === 0}
                    onPress={() => setIsRemoveOpen(true)}
                  />
                ) : null}
                <VStack alignItems="center">
                  <Text fontSize="10" color="blueGray.400">REBUYS</Text>
                  <Text fontSize="md" color="teal.300">{player.quantity_rebuy}</Text>
                </VStack>
                {canManage ? (
                  <IconButton
                    size="sm"
                    variant="solid"
                    colorScheme="blueGray"
                    borderRadius="md"
                    _icon={{ as: Entypo, name: "plus", color: "white" }}
                    onPress={() => setIsAddOpen(true)}
                  />
                ) : null}
              </HStack>
            </HStack>
            <HStack alignItems="center" justifyContent="space-between">
              <Text fontSize="10" color="blueGray.400">CHIP COUNT</Text>
              {canManage ? (
                <Input
                  value={String(player.final_chips)}
                  keyboardType="numeric"
                  maxLength={6}
                  onChange={(e: any) => onChipChange(player.id, e.target.value)}
                  color="white"
                  variant="filled"
                  backgroundColor="blueGray.900"
                  borderColor="blueGray.700"
                  w="50%"
                  textAlign="right"
                />
              ) : (
                <Text color="white">{player.final_chips}</Text>
              )}
            </HStack>
          </VStack>
        ) : null}
      </VStack>
    </>
  );
}
