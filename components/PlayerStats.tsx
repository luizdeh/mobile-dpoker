import { Box, Button, HStack, VStack, Text } from "native-base";
import React from "react";

interface Props {
  stats: any;
}

export default function PlayerStats({ stats }: Props) {
  return (
    <Box alignItems="center">
      <Button
        p="2"
        colorScheme="blueGray"
        variant="solid"
        textAlign="center"
        w="90%"
        mt="2"
      >
        {stats ? stats[0].statName : "button"}
      </Button>
      <VStack w="90%" space={2}>
        {stats
          ? stats.map((subItem: any, idx: number) => {
            <HStack
              key={idx}
              w="100%"
              alignItems="center"
              mb="1"
              h="12"
              backgroundColor="blueGray.100"
              px="2"
            >
              <Text flex={1}>{subItem.name.toUpperCase()}</Text>
              <Text textAlign="right">{subItem.stat}</Text>
            </HStack>;
          })
          : null}
      </VStack>
    </Box>
  );
}
