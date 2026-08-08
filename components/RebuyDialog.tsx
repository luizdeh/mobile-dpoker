import { AlertDialog, Button, Center, View, VStack } from "native-base";
import React, { useRef, useState } from "react";

interface Props {
  player: string;
  isOpen: boolean;
  onClose: () => void;
  setConfirm: (confirm: boolean) => void;
  mode?: "add" | "remove";
}

export default function RebuyDialog({ player, isOpen, onClose, setConfirm, mode = "add" }: Props) {
  const cancelRef = useRef(null);

  const isRemove = mode === "remove";

  return <Center>
    <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
      <AlertDialog.Content>
        <AlertDialog.CloseButton />
        <AlertDialog.Header>{isRemove ? "Remove Rebuy" : "Confirm Rebuy"}</AlertDialog.Header>
        <AlertDialog.Body>
          {isRemove
            ? `Remove one rebuy from: ${player}`
            : `Confirm rebuy for: ${player}`}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button.Group space={2}>
            <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
              CANCEL
            </Button>
            <Button colorScheme={isRemove ? "danger" : "emerald"} onPress={() => setConfirm(true)}>
              CONFIRM
            </Button>
          </Button.Group>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  </Center>;
};