import { AlertDialog, Button, Center, View, VStack } from "native-base";
import React, { useRef, useState } from "react";

interface Props {
  player: string;
  isOpen: boolean;
  onClose: () => void;
  setConfirm: (confirm: boolean) => void;
}

export default function RebuyDialog({ player, isOpen, onClose, setConfirm }: Props) {
  const cancelRef = useRef(null);

  return <Center>
    <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
      <AlertDialog.Content>
        <AlertDialog.CloseButton />
        <AlertDialog.Header>Confirm Rebuy</AlertDialog.Header>
        <AlertDialog.Body>
          Once added, a rebuy cannot be undone. Confirm rebuy for:
          {player}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <Button.Group space={2}>
            <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
              CANCEL
            </Button>
            <Button colorScheme="emerald" onPress={() => setConfirm(true)}>
              CONFIRM
            </Button>
          </Button.Group>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  </Center>;
};