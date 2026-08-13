import { AlertDialog, Button, Center, Divider, Text, VStack } from "native-base";
import React, { useRef } from "react";

interface Props {
  player: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RemovePlayerDialog({ player, isOpen, onClose, onConfirm }: Props) {
  const cancelRef = useRef(null);

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Remove Player</AlertDialog.Header>
          <AlertDialog.Body>
            <VStack space={2}>
              <Text>Remove {player} from this game?</Text>
              <Divider />
              <Text>They can be added back later from the ADD PLAYER list.</Text>
            </VStack>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                CANCEL
              </Button>
              <Button colorScheme="danger" onPress={onConfirm}>
                REMOVE
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
}
