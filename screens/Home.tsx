import React from "react";
import { Center, VStack, Button, Box } from "native-base";
import { Image } from "react-native";

const navLinks = [
  { link: "Game", title: "CREATE NEW GAME" },
  { link: "Games", title: "GAMES" },
  { link: "Players", title: "PLAYERS" },
  { link: "Stats", title: "STATISTICS" },
  { link: "Matchups", title: "MATCHUPS" },
];

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <Box h="100%" backgroundColor="black">
      <Box flex={1} w="100%" minH="100px">
        <Image
          style={{ width: "100%", height: "100%" }}
          source={require("../assets/logo.jpg")}
        />
      </Box>
      <Center flex={2} px={4}>
        <VStack space={4} alignItems="center" w="100%">
          {navLinks.map((item: any, idx: number) => {
            const name = item.link;
            return (
              <Button
                key={idx}
                variant="solid"
                colorScheme="blueGray"
                width="90%"
                p="4"
                onPress={() => navigation.navigate(name)}
              >
                {item.title}
              </Button>
            );
          })}
        </VStack>
      </Center>
    </Box >
  );
}
