import { AlertDialog, Button, Center, Input, Text, VStack } from "native-base";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  gameDate: string;
  currentValue: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  isSaving: boolean;
}

export default function EditRakeValueDialog({
  gameDate,
  currentValue,
  isOpen,
  onClose,
  onConfirm,
  isSaving,
}: Props) {
  const cancelRef = useRef(null);
  const [value, setValue] = useState(currentValue.toString());

  useEffect(() => {
    if (isOpen) setValue(currentValue.toString());
  }, [isOpen, currentValue]);

  const parsed = Number(value);
  const isValid = value.trim().length > 0 && Number.isFinite(parsed) && parsed >= 0;

  return (
    <Center>
      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Edit Rake Value</AlertDialog.Header>
          <AlertDialog.Body>
            <VStack space={2}>
              <Text>New rake value for the game on {gameDate}:</Text>
              <Input value={value} onChangeText={setValue} keyboardType="numeric" autoFocus />
            </VStack>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef}>
                CANCEL
              </Button>
              <Button
                colorScheme="teal"
                isDisabled={!isValid}
                isLoading={isSaving}
                onPress={() => onConfirm(parsed)}
              >
                SAVE
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Center>
  );
}
