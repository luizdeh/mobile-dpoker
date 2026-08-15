import { AlertDialog, Button, Center, Text } from "native-base";
import React, { useRef } from "react";

interface Props {
  player: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function EliminatePlayerDialog({ player, isOpen, onClose, onConfirm }: Props) {
  const cancelRef = useRef(null);

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Confirm Elimination</AlertDialog.Header>
          <AlertDialog.Body>
            <Text>Eliminate {player} from this tournament?</Text>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                CANCEL
              </Button>
              <Button colorScheme="danger" onPress={onConfirm}>
                ELIMINATE
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
}
