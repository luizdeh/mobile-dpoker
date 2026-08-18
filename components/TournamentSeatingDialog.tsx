import React from "react";
import { Box, Divider, HStack, Modal, Text, VStack } from "native-base";
import { SeatingTable } from "../lib/types";

interface Props {
  seating: SeatingTable[] | null | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export default function TournamentSeatingDialog({ seating, isOpen, onClose }: Props) {
  const tables = seating ?? [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Content maxWidth="400px" backgroundColor="blueGray.900">
        <Modal.CloseButton _icon={{ color: "blueGray.400" }} />
        <Modal.Header backgroundColor="blueGray.900" borderColor="blueGray.800">
          <Text color="white" bold>
            Table Seating
          </Text>
        </Modal.Header>
        <Modal.Body>
          <VStack space={5} pb={2}>
            {tables.map((table, tableIndex) => (
              <VStack key={table.label} space={1}>
                <Text color="teal.300" fontSize="sm" bold>
                  {table.label}
                </Text>
                <Box borderRadius="sm" overflow="hidden">
                  {table.seats.map((seat, index) => (
                    <HStack
                      key={seat.person_id}
                      justifyContent="space-between"
                      alignItems="center"
                      px={2}
                      py={2}
                      backgroundColor={index % 2 === 0 ? "transparent" : "blueGray.800"}
                    >
                      <Text color="blueGray.400" fontSize="xs" bold>
                        {seat.position}
                      </Text>
                      <Text color="white" fontSize="sm" isTruncated maxWidth="200">
                        {seat.name.toUpperCase()}
                      </Text>
                    </HStack>
                  ))}
                </Box>
                {tableIndex < tables.length - 1 ? <Divider backgroundColor="blueGray.800" mt={2} /> : null}
              </VStack>
            ))}
            {!tables.length ? (
              <Text color="blueGray.400" fontSize="xs" textAlign="center" py={4}>
                No seating assignment for this tournament.
              </Text>
            ) : null}
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
