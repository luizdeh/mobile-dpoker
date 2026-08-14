import { AlertDialog, Button, Center, Text } from "native-base";
import React, { useRef } from "react";

interface Props {
  gameDate: string;
  willWaive: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}

export default function FreePassDialog({ gameDate, willWaive, isOpen, onClose, onConfirm, isSaving }: Props) {
  const cancelRef = useRef(null);

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>{willWaive ? "Free Pass" : "Undo Free Pass"}</AlertDialog.Header>
          <AlertDialog.Body>
            <Text>
              {willWaive
                ? `No rake will be charged for the game on ${gameDate}.`
                : `Rake will be charged again for the game on ${gameDate}.`}
            </Text>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                CANCEL
              </Button>
              <Button colorScheme="teal" onPress={onConfirm} isLoading={isSaving}>
                CONFIRM
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
}
