import { AlertDialog, Button, Center } from "native-base";
import React, { useRef } from "react";

interface Props {
  playerName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeletePlayerDialog({ playerName, isOpen, onClose, onConfirm, isDeleting }: Props) {
  const cancelRef = useRef(null);

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Delete Player</AlertDialog.Header>
          <AlertDialog.Body>
            Permanently delete {playerName} from the roster? This cannot be undone.
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                CANCEL
              </Button>
              <Button colorScheme="danger" onPress={onConfirm} isLoading={isDeleting}>
                DELETE
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
}
