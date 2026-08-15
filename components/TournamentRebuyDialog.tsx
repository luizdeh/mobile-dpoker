import { AlertDialog, Button, Center } from "native-base";
import React, { useRef } from "react";

interface Props {
  player: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function TournamentRebuyDialog({ player, isOpen, onClose, onConfirm }: Props) {
  const cancelRef = useRef(null);

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Confirm Rebuy</AlertDialog.Header>
          <AlertDialog.Body>Confirm rebuy for: {player}</AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                CANCEL
              </Button>
              <Button colorScheme="teal" onPress={onConfirm}>
                CONFIRM
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
}
