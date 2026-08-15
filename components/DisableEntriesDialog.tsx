import { AlertDialog, Button, Center, Text } from "native-base";
import React, { useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DisableEntriesDialog({ isOpen, onClose, onConfirm }: Props) {
  const cancelRef = useRef(null);

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Disable Entries</AlertDialog.Header>
          <AlertDialog.Body>
            <Text>
              This stops new players from being added and stops any further re-buys for the rest of this
              tournament. This cannot be undone.
            </Text>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                CANCEL
              </Button>
              <Button colorScheme="danger" onPress={onConfirm}>
                DISABLE
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
}
