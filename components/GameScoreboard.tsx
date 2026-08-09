import { AntDesign, Entypo, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Button, HStack, IconButton, Modal, Text, VStack, useToast } from 'native-base';
import React, { useEffect, useState } from 'react';
import { doItAll, paymentsToText, copyPaymentsToClipboard } from '../utils/payments';

interface Prop {
  game: any;
  num: number;
}

function GameScoreboard({ game, num }: Prop) {
  const [showStats, setShowStats] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    if (showStats) {
      const all = doItAll(game)
      setPayments(all)
    }
  }, [showStats])

  const handleCopyPayments = async () => {
    const success = await copyPaymentsToClipboard(paymentsToText(payments));
    toast.show({ description: success ? "Copied to clipboard." : "Failed to copy to clipboard." });
  };

  const abbreviateName = (player: string) => {
    const [name, ...lastName] = player.split(' ').filter(Boolean);
    return lastName.length && player.length >= 11 ? `${name} ${lastName[0][0]}.` : `${name} ${lastName}`;
  }

  return (
    <VStack my="2">
      <HStack py="2" alignItems="center" backgroundColor="blueGray.600">
        <Text flex={1} textAlign="center" fontSize="md" color="blueGray.200">
          Game #{num}
        </Text>
        <Text flex={1} textAlign="center" fontSize="xs" color="blueGray.200">
          {game.date.slice(0, 10)}
        </Text>
        <VStack flex={1}>
          <Text flex={1} textAlign="center" fontSize="xs" color="blueGray.200">
            {game.active_players.length} players
          </Text>
          <Text flex={1} textAlign="center" fontSize="xs" color="blueGray.200">
            $ {game.sum_of_chips * game.chip_value}
          </Text>
        </VStack>
        <IconButton
          _icon={
            showStats
              ? {
                as: AntDesign,
                name: 'caretup',
                color: 'blueGray.200',
                size: 'md',
              }
              : {
                as: AntDesign,
                name: 'caretdown',
                color: 'blueGray.200',
                size: 'md',
              }
          }
          onPress={() => setShowStats((state) => !state)}
        />
      </HStack>
      {showStats ? (
        <VStack>
          <HStack space={2} backgroundColor="teal.600" p={1} alignItems="center">
            <Text flex={2} textAlign="left" color="white" fontWeight="semibold" fontSize="xs">
              PLAYER
            </Text>
            <Text flex={1} textAlign="center">
              <FontAwesome5 flex={1} name="plus" size={14} color="white" />
            </Text>
            <Text flex={1} textAlign="center">
              <FontAwesome name="database" size={14} color="white" />
            </Text>
            <Text flex={1} textAlign="center">
              <FontAwesome5 flex={1} name="percentage" size={14} color="white" />
            </Text>
            <Text flex={1} textAlign="center">
              <FontAwesome5 flex={1} name="arrow-down" size={14} color="white" />
            </Text>
            <Text flex={1} textAlign="center">
              <FontAwesome5 flex={1} name="arrow-up" size={14} color="white" />
            </Text>
            <IconButton
              flex={1}
              variant="unstyled"
              p={0}
              _icon={{ as: Entypo, name: 'credit', color: 'amber.400', size: 'md' }}
              onPress={() => setShowPayments(true)}
            />
          </HStack>
          {game.active_players
            .sort((a: any, b: any) => b.profit - a.profit)
            .map((player: any, idx: number) => {
              return (
                <HStack
                  key={idx}
                  space={2}
                  p={1}
                  backgroundColor={idx % 2 === 0 ? 'white' : 'teal.50'}
                  borderWidth="0"
                  alignItems="center"
                  lineHeight={14}
                >
                  <Text flex={2} fontSize="xs">
                    {abbreviateName(player.name).toUpperCase()}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="10">
                    {player.quantity_rebuy}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="10">
                    {player.chips}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="10">
                    {player.equity.toFixed(2)}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="10">
                    {player.investment}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="10">
                    {player.prize.toFixed(2)}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="10" bold>
                    {player.profit.toFixed(2)}
                  </Text>
                </HStack>
              );
            })}
        </VStack>
      ) : null}
      <Modal isOpen={showPayments} onClose={() => setShowPayments(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>
            <Text fontSize="md" bold>Payment Plan - Game #{num}</Text>
          </Modal.Header>
          <Modal.Body>
            <VStack>
              <HStack py={1} backgroundColor="teal.600" alignItems="center" space={2}>
                <Text flex={1} fontSize="xs" color="teal.100" marginLeft={2}>FROM</Text>
                <Text flex={1} fontSize="xs" color="teal.100">TO</Text>
                <Text flex={1} fontSize="xs" textAlign="right" color="teal.100" marginRight={2}>AMOUNT</Text>
              </HStack>
              {payments.length ? (
                payments.map((payment: any, idx: number) => {
                  return (
                    <HStack key={idx} py={1} backgroundColor={idx % 2 === 0 ? 'white' : 'teal.50'}>
                      <Text flex={1} fontSize="xs" color="teal.800" marginLeft={2}>{abbreviateName(payment.from).toUpperCase()}</Text>
                      <Text flex={1} fontSize="xs" color="teal.800">{abbreviateName(payment.to).toUpperCase()}</Text>
                      <Text flex={1} fontSize="xs" textAlign="right" color="teal.800" marginRight={2}>${payment.transfer}</Text>
                    </HStack>
                  )
                })
              ) : (
                <Text fontSize="xs" textAlign="center" py={2}>No payments needed.</Text>
              )}
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button size="sm" colorScheme="teal" onPress={handleCopyPayments} isDisabled={!payments.length}>
              COPY TO CLIPBOARD
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </VStack>
  );
}

export default React.memo(GameScoreboard);