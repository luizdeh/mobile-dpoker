import { AlertDialog, Button, Center, Pressable, HStack, Icon, Text, VStack } from "native-base";
import { AntDesign } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  gameDate: string;
  players: { id: number; name: string }[];
  currentDealerId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dealerId: number | null) => void;
  isSaving: boolean;
}

export default function SetDealerDialog({
  gameDate,
  players,
  currentDealerId,
  isOpen,
  onClose,
  onConfirm,
  isSaving,
}: Props) {
  const cancelRef = useRef(null);
  const [selected, setSelected] = useState<number | null>(currentDealerId);

  useEffect(() => {
    if (isOpen) setSelected(currentDealerId);
  }, [isOpen, currentDealerId]);

  const options = [{ id: null as number | null, name: "NO DEALER" }, ...players];

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Dealer</AlertDialog.Header>
          <AlertDialog.Body>
            <VStack space={1}>
              <Text mb={1}>Who dealt the game on {gameDate}? The dealer doesn't pay rake.</Text>
              {options.map((option) => {
                const isSelected = selected === option.id;
                return (
                  <Pressable key={option.id ?? "none"} onPress={() => setSelected(option.id)}>
                    <HStack justifyContent="space-between" alignItems="center" py={2}>
                      <Text bold={isSelected}>{option.name.toUpperCase()}</Text>
                      <Icon
                        as={AntDesign}
                        name={isSelected ? "checkcircle" : "checkcircleo"}
                        size="sm"
                        color={isSelected ? "teal.500" : "coolGray.400"}
                      />
                    </HStack>
                  </Pressable>
                );
              })}
            </VStack>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                CANCEL
              </Button>
              <Button
                colorScheme="teal"
                isDisabled={selected === currentDealerId}
                isLoading={isSaving}
                onPress={() => onConfirm(selected)}
              >
                SAVE
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
}
