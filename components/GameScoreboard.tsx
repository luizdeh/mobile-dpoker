import React, { useState } from "react";
import { Text, VStack, HStack } from "native-base";
import { IconButton } from "native-base";
import { AntDesign } from "@expo/vector-icons";

interface Prop {
  game: any;
  index: number;
}

export default function GameScoreboard({ game, index }: Prop) {
  const [showStats, setShowStats] = useState(false);
  return (
    <VStack my="2" borderWidth="1" borderColor="emerald.400">
      <HStack py="2" alignItems="center" backgroundColor="emerald.100">
        <Text flex={2} textAlign="center" fontSize="md">
          Game #{index + 1}
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
            textAlign="right"
            backgroundColor="emerald.600"
            p={1}
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
            <Text color="white" fontWeight="semibold" flex={1}>
              R
            </Text>
            <Text color="white" fontWeight="semibold" flex={1}>
              I
            </Text>
            <Text color="white" fontWeight="semibold" flex={1}>
              P
            </Text>
            <Text color="white" fontWeight="semibold" flex={1}>
              $
            </Text>
            <Text color="white" fontWeight="semibold" flex={1}>
              %
            </Text>
          </HStack>
          {game.active_players.map((player: any, idx: number) => {
            return (
              <HStack
                key={idx}
                space={2}
                fontSize="xs"
                textAlign="right"
                p={1}
                backgroundColor={idx % 2 === 0 ? "white" : "coolGray.100"}
                lineHeight="xl"
              >
                <Text flex={2} textAlign="left">
                  {player.name.toUpperCase()}
                </Text>
                <Text flex={1}>{player.quantity_rebuy}</Text>
                <Text flex={1}>{player.investment}</Text>
                <Text flex={1}>{player.prize.toFixed(2)}</Text>
                <Text flex={1}>{player.profit.toFixed(2)}</Text>
                <Text flex={1}>{player.equity.toFixed(2)}</Text>
              </HStack>
            );
          })}
        </VStack>
      ) : null}
    </VStack>
  );
}
