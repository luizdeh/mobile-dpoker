import React, { useState } from "react";
import { Text, VStack, HStack } from "native-base";
import { IconButton } from "native-base";
import { AntDesign } from "@expo/vector-icons";

interface Prop {
  game: any;
}

export default function GameScoreboard({ game }: Prop) {
  const [showStats, setShowStats] = useState(false);
  return (
    <VStack my="2" borderWidth="1" borderColor="emerald.400">
      <HStack py="2" alignItems="center" backgroundColor="emerald.100">
        <Text flex={2} textAlign="center" fontSize="md">
          Game #{game.id}
        </Text>
        <Text flex={1}>{game.active_players.length} players</Text>
        <IconButton
          _icon={
            showStats
              ? {
                as: AntDesign,
                name: "caretup",
                color: "blueGray.600",
                size: "md",
              }
              : {
                as: AntDesign,
                name: "caretdown",
                color: "blueGray.600",
                size: "md",
              }
          }
          onPress={() => setShowStats((state) => !state)}
        />
      </HStack>
      {showStats ? (
        <VStack>
          <HStack
            space={2}
            backgroundColor="emerald.600"
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
            <Text
              color="white"
              fontWeight="semibold"
              flex={1}
              textAlign="center"
              fontSize="xs"
            >
              R
            </Text>
            <Text
              color="white"
              fontWeight="semibold"
              flex={1}
              textAlign="center"
              fontSize="xs"
            >
              I
            </Text>
            <Text
              color="white"
              fontWeight="semibold"
              flex={1}
              textAlign="center"
              fontSize="xs"
            >
              P
            </Text>
            <Text
              color="white"
              fontWeight="semibold"
              flex={1}
              textAlign="center"
              fontSize="xs"
            >
              $
            </Text>
            <Text
              color="white"
              fontWeight="semibold"
              flex={1}
              textAlign="center"
              fontSize="xs"
            >
              %
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
                  backgroundColor={idx % 2 === 0 ? "white" : "coolGray.100"}
                  lineHeight="xl"
                >
                  <Text flex={2} fontSize="xs">
                    {myName.toUpperCase()}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="xs">
                    {player.quantity_rebuy}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="xs">
                    {player.investment}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="xs">
                    {player.prize.toFixed(2)}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="xs">
                    {player.profit.toFixed(2)}
                  </Text>
                  <Text flex={1} textAlign="center" fontSize="xs">
                    {player.equity.toFixed(2)}
                  </Text>
                </HStack>
              );
            })}
        </VStack>
      ) : null}
    </VStack>
  );
}
