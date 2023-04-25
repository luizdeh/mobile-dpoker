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
    <Center
      _dark={{ bg: "blueGray.900" }}
      _light={{ bg: "blueGray.50" }}
      px={4}
      flex={1}
    >
      <VStack space={5} alignItems="center">
        <Heading size="lg">D/Poker</Heading>
        <Button onPress={() => navigation.navigate("Game")}>
          CREATE NEW GAME
        </Button>
        <br />
        <Button onPress={() => navigation.navigate("Players")}>Players</Button>
        <Button onPress={() => navigation.navigate("Stats")}>Statistics</Button>
        <br />
        <Button onPress={() => navigation.navigate("Profile")}>
          User Profile
        </Button>
        <br />
        <ToggleDarkMode />
      </VStack>
    </Center>
  );
}
