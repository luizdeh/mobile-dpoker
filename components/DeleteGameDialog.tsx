import { AlertDialog, Button, Center, Divider, HStack, Text, VStack } from "native-base";
import React, { useRef } from "react";
import { formatDateBR } from "../lib/formatDate";

interface Props {
  game: any;
  players: any[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteGameDialog({ game, players, isOpen, onClose, onConfirm, isDeleting }: Props) {
  const cancelRef = useRef(null);

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Delete Game</AlertDialog.Header>
          <AlertDialog.Body>
            <VStack space={2}>
              <Text>This permanently deletes the game below and all of its player records. This cannot be undone.</Text>
              <Divider my={1} />
              <Text bold>Game #{game.id} — {formatDateBR(game.date)}</Text>
              <Text fontSize="xs">Buy-in: {game.buy_in_value} | Re-buy: {game.re_buy_value} | Chip value: {game.chip_value}</Text>
              <Text fontSize="xs" bold mt={1}>Players ({players.length}):</Text>
              {players.map((player: any) => (
                <HStack key={player.id} justifyContent="space-between">
                  <Text fontSize="xs">{player.name.toUpperCase()}</Text>
                  <Text fontSize="xs">{player.chips} chips, {player.quantity_rebuy} rebuys</Text>
                </HStack>
              ))}
            </VStack>
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
