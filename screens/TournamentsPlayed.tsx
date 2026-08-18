import React, { useState } from "react";
import { Box, VStack, HStack, Text, Pressable, Icon, IconButton, Modal, Button, ScrollView, Center, useToast } from "native-base";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import useTournamentsContext from "../context/useTournamentsContext";
import { ordinal } from "../lib/ordinal";
import { doItAll, paymentsToText, copyPaymentsToClipboard } from "../utils/payments";

const formatMoney = (value: number) => (Math.round((value + Number.EPSILON) * 100) / 100).toString();

export default function TournamentsPlayed() {
  const { tournamentsPlayed } = useTournamentsContext();
  const toast = useToast();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [paymentsTournament, setPaymentsTournament] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  const tournaments = tournamentsPlayed ?? [];

  const handleShowPayments = (tournament: any) => {
    const settlement = doItAll({
      id: tournament.id,
      active_players: tournament.entries.map((entry: any) => ({
        person_id: entry.person_id,
        name: entry.name,
        profit: entry.profit,
      })),
    });
    setPayments(settlement);
    setPaymentsTournament(tournament);
  };

  const handleCopyPayments = async () => {
    const success = await copyPaymentsToClipboard(paymentsToText(payments));
    toast.show({ description: success ? "Copied to clipboard." : "Failed to copy to clipboard." });
  };

  return (
    <Box h="100%" backgroundColor="black" px={2} py={2}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={2} px={2} py={2}>
          {tournaments.map((tournament: any) => {
            const isExpanded = expandedId === tournament.id;
            const date = new Date(tournament.date).toLocaleDateString("pt-BR");
            return (
              <HStack key={tournament.id} space={2} alignItems="center">
                <Text color="blueGray.600" fontSize="sm" bold width="28px" textAlign="right">
                  #{tournament.sequence_number}
                </Text>
                <VStack flex={1} backgroundColor="blueGray.800" borderRadius="sm" overflow="hidden">
                <HStack justifyContent="space-between" alignItems="center" px={3} py={3}>
                  <Pressable
                    flex={1}
                    onPress={() => setExpandedId((prev) => (prev === tournament.id ? null : tournament.id))}
                  >
                    <VStack>
                      <Text color="white" fontSize="sm" bold>
                        {date}
                      </Text>
                      <Text color="blueGray.400" fontSize="10">
                        {tournament.entrant_count} ENTRANTS
                      </Text>
                    </VStack>
                  </Pressable>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    _icon={{ as: FontAwesome, name: "dollar", size: "sm", color: "teal.400" }}
                    onPress={() => handleShowPayments(tournament)}
                  />
                  <Pressable
                    flex={1}
                    onPress={() => setExpandedId((prev) => (prev === tournament.id ? null : tournament.id))}
                  >
                    <VStack alignItems="flex-end">
                      <Text color="teal.300" fontSize="sm" bold isTruncated maxWidth="150">
                        {(tournament.champion?.name ?? "—").toUpperCase()}
                      </Text>
                      <Text color="blueGray.500" fontSize="10">
                        CHAMPION
                      </Text>
                    </VStack>
                  </Pressable>
                </HStack>
                {isExpanded ? (
                  <VStack pb={3} pt={1} borderTopWidth={1} borderColor="blueGray.700">
                    <HStack px={3} py={1} space={2}>
                      <Text flex={2} fontSize="10" color="blueGray.500" bold>
                        PLAYER
                      </Text>
                      <Text flex={1} fontSize="10" color="blueGray.500" bold textAlign="center">
                        PTS
                      </Text>
                      <Text flex={1} fontSize="10" color="blueGray.500" bold textAlign="right">
                        NET
                      </Text>
                    </HStack>
                    {tournament.entries.map((entry: any, index: number) => (
                      <HStack
                        key={entry.id}
                        alignItems="center"
                        px={3}
                        py={1}
                        space={2}
                        backgroundColor={index % 2 === 0 ? "blueGray.900" : "transparent"}
                      >
                        <VStack flex={2}>
                          <Text color="white" fontSize="sm" isTruncated>
                            {(entry.name ?? "").toUpperCase()}
                          </Text>
                          <HStack space={1} alignItems="center">
                            <Text color="blueGray.500" fontSize="10">
                              {entry.finish_position ? ordinal(entry.finish_position) : "—"}
                            </Text>
                            {entry.is_split ? (
                              <Icon as={AntDesign} name="team" size="2xs" color="blueGray.500" />
                            ) : null}
                          </HStack>
                        </VStack>
                        <Text flex={1} color="blueGray.300" fontSize="sm" textAlign="center">
                          {entry.points}
                        </Text>
                        <Text
                          flex={1}
                          color={entry.profit >= 0 ? "teal.300" : "rose.400"}
                          fontSize="sm"
                          bold
                          textAlign="right"
                        >
                          {formatMoney(entry.profit)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                ) : null}
                </VStack>
              </HStack>
            );
          })}
          {!tournaments.length ? (
            <Center py={8}>
              <Text color="blueGray.400" fontSize="xs">
                No tournaments played yet.
              </Text>
            </Center>
          ) : null}
        </VStack>
      </ScrollView>
      <Modal isOpen={!!paymentsTournament} onClose={() => setPaymentsTournament(null)}>
        <Modal.Content maxWidth="400px" backgroundColor="blueGray.900">
          <Modal.CloseButton _icon={{ color: "blueGray.400" }} />
          <Modal.Header backgroundColor="blueGray.900" borderColor="blueGray.800">
            <Text color="white" bold>
              Payment Plan
              {paymentsTournament ? ` - ${new Date(paymentsTournament.date).toLocaleDateString("pt-BR")}` : ""}
            </Text>
          </Modal.Header>
          <Modal.Body>
            <VStack>
              <HStack py={1} px={2} backgroundColor="blueGray.800" alignItems="center" space={2}>
                <Text flex={1} fontSize="10" color="blueGray.400" bold>
                  FROM
                </Text>
                <Text flex={1} fontSize="10" color="blueGray.400" bold>
                  TO
                </Text>
                <Text flex={1} fontSize="10" color="blueGray.400" bold textAlign="right">
                  AMOUNT
                </Text>
              </HStack>
              {payments.length ? (
                payments.map((payment: any, idx: number) => (
                  <HStack
                    key={idx}
                    py={2}
                    px={2}
                    space={2}
                    backgroundColor={idx % 2 === 0 ? "transparent" : "blueGray.800"}
                  >
                    <Text flex={1} fontSize="10" color="white" isTruncated>
                      {payment.from}
                    </Text>
                    <Text flex={1} fontSize="10" color="white" isTruncated>
                      {payment.to}
                    </Text>
                    <Text flex={1} fontSize="xs" color="teal.300" bold textAlign="right">
                      ${payment.transfer}
                    </Text>
                  </HStack>
                ))
              ) : (
                <Text color="blueGray.400" fontSize="xs" textAlign="center" py={4}>
                  No payments needed.
                </Text>
              )}
            </VStack>
          </Modal.Body>
          <Modal.Footer backgroundColor="blueGray.900" borderColor="blueGray.800">
            <Button size="sm" colorScheme="teal" onPress={handleCopyPayments} isDisabled={!payments.length}>
              COPY TO CLIPBOARD
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
}
