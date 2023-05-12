import React from "react";
import {
  Text,
  HStack,
  Center,
  Heading,
  Switch,
  useColorMode,
  VStack,
  Button,
  Box,
} from "native-base";

// TODO: create a modal component that shows game parameters to edit or just confirm

// Color Switch Component
function ToggleDarkMode() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <HStack space={2} alignItems="center">
      <Text>Dark</Text>
      <Switch
        isChecked={colorMode === "light"}
        onToggle={toggleColorMode}
        aria-label={
          colorMode === "light" ? "switch to dark mode" : "switch to light mode"
        }
      />
      <Text>Light</Text>
    </HStack>
  );
}

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <Box h="100%">
      <Heading
        size="2xl"
        color="tertiary.800"
        lineHeight="2xl"
        p={8}
        textAlign="center"
      >
        D/POKER
      </Heading>
      <Center
        _dark={{ bg: "blueGray.900" }}
        _light={{ bg: "blueGray.50" }}
        px={4}
        flex={1}
      >
        <VStack space={8} alignItems="center" w="100%">
          <Button
            variant="solid"
            colorScheme="blueGray"
            width="90%"
            p="4"
            onPress={() => navigation.navigate("Game")}
          >
            CREATE NEW GAME
          </Button>
          <Button
            variant="solid"
            colorScheme="blueGray"
            width="90%"
            p="4"
            onPress={() => navigation.navigate("Games")}
          >
            GAMES
          </Button>
          <Button
            variant="solid"
            colorScheme="blueGray"
            width="90%"
            p="4"
            onPress={() => navigation.navigate("Players")}
          >
            PLAYERS
          </Button>
          <Button
            variant="solid"
            colorScheme="blueGray"
            width="90%"
            p="4"
            onPress={() => navigation.navigate("Stats")}
          >
            STATISTICS
          </Button>
          <br />
          {/*<Button onPress={() => navigation.navigate("Profile")}>
          User Profile
        </Button>*/}
          <br />
          <ToggleDarkMode />
        </VStack>
      </Center>
    </Box>
  );
}
