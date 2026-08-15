import { AlertDialog, Button, Center, Divider, Text, VStack } from "native-base";
import React, { useRef } from "react";

interface Props {
  players: string[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isStarting: boolean;
}

export default function StartTournamentDialog({ players, isOpen, onClose, onConfirm, isStarting }: Props) {
  const cancelRef = useRef(null);

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Start Tournament</AlertDialog.Header>
          <AlertDialog.Body>
            <VStack space={2}>
              <Text>Start with {players.length} players:</Text>
              <Divider />
              {players.map((name) => (
                <Text key={name} fontSize="xs">{name}</Text>
              ))}
            </VStack>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                CANCEL
              </Button>
              <Button colorScheme="teal" onPress={onConfirm} isLoading={isStarting}>
                START
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
}
