import { AntDesign, Entypo, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Button, HStack, IconButton, Text, View, VStack } from 'native-base';
import React, { useEffect, useState } from 'react';
import { doItAll } from '../utils/payments';

interface Prop {
  game: any;
  index: number;
}

export default function GameScoreboard({ game, index }: Prop) {
  const [showStats, setShowStats] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (showStats) {
      console.log(`game #${index + 1}`)
      console.log({ game })
      const all = doItAll(game)
      setPayments(all)
      console.log({ all })
    }
  }, [showStats])

  const abbreviateName = (player: string) => {
    const [name, ...lastName] = player.split(' ').filter(Boolean);
    return lastName.length && player.length >= 11 ? `${name} ${lastName[0][0]}.` : `${name} ${lastName}`;
  }

  return (
    <VStack my="2">
      <HStack py="2" alignItems="center" backgroundColor="blueGray.600">
        <Text flex={1} textAlign="center" fontSize="md" color="blueGray.200">
          Game #{index + 1}
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
            <Text flex={1} textAlign="center">
              <Entypo flex={1} name="credit" size={16} color={showPayments ? 'white' : 'blueGray.200'} onPress={() => setShowPayments((state) => !state)} />
            </Text>
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
          {showPayments && payments ?
            <VStack>
              <View flex={1} backgroundColor="teal.800" py={2}>
                <Text flex={1} textAlign="center" color="white" fontWeight="semibold" fontSize="xs" onPress={() => setShowPayments(false)}>PAYMENT PLAN</Text>
              </View>
              <HStack py={1} backgroundColor='teal.600' alignItems="center" space={2}>
                <Text flex={1} fontSize="xs" color="teal.100" marginLeft={2}>FROM</Text>
                <Text flex={1} fontSize="xs" color="teal.100">TO</Text>
                <Text flex={1} fontSize="xs" textAlign="right" color="teal.100" marginRight={2}>AMOUNT</Text>
              </HStack>
              {payments.map((payment: any, idx: number) => {
                return (
                  <HStack key={idx} py={1} backgroundColor={idx % 2 === 0 ? 'white' : 'teal.50'}>
                    <Text flex={1} fontSize="xs" color="teal.800" marginLeft={2}>{abbreviateName(payment.from)}</Text>
                    <Text flex={1} fontSize="xs" color="teal.800">{abbreviateName(payment.to)}</Text>
                    <Text flex={1} fontSize="xs" textAlign="right" color="teal.800" marginRight={2}>${payment.transfer}</Text>
                  </HStack>
                )
              })}
            </VStack>
            : null
          }
        </VStack>
      ) : null}
    </VStack>
  );
}