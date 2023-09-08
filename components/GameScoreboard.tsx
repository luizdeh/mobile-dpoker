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
          <HStack
            space={2}
            backgroundColor="teal.600"
            p={1}
            alignItems="center"
          >
            <Text
              flex={2}
              textAlign="left"
              color="white"
              fontWeight="semibold"
              fontSize="xs"
            >
              PLAYER
            </Text>
            <Text flex={1} textAlign="center">
              <FontAwesome5 flex={1} name="plus" size={14} color="white" />
            </Text>
            <Text flex={1} textAlign="center">
              <FontAwesome name="database" size={14} color="white" />
            </Text>
            <Text flex={1} textAlign="center">
              <FontAwesome5
                flex={1}
                name="percentage"
                size={14}
                color="white"
              />
            </Text>
            <Text flex={1} textAlign="center">
              <FontAwesome5
                flex={1}
                name="arrow-down"
                size={14}
                color="white"
              />
            </Text>
            <Text flex={1} textAlign="center">
              <FontAwesome5 flex={1} name="arrow-up" size={14} color="white" />
            </Text>
            <Text flex={1} textAlign="center">
              <Entypo flex={1} name="credit" size={16} color="white" />
            </Text>
          </HStack>
          {game.active_players
            .sort((a: any, b: any) => b.profit - a.profit)
            .map((player: any, idx: number) => {
              const [name, ...lastName] = player.name
                .split(" ")
                .filter(Boolean);
              const myName =
                lastName.length && player.name.length >= 11
                  ? `${name} ${lastName[0][0]}.`
                  : `${name} ${lastName}`;
              return (
                <HStack
                  key={idx}
                  space={2}
                  p={1}
                  backgroundColor={idx % 2 === 0 ? "white" : "teal.50"}
                  borderWidth="0"
                  alignItems="center"
                  lineHeight={14}
                >
                  <Text flex={2} fontSize="xs">
                    {myName.toUpperCase()}
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
    </VStack>
  );
}
