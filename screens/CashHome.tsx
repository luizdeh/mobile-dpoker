import React, { useCallback, useState } from "react";
import { Center, VStack, Button, Box, IconButton } from "native-base";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import useAuthContext from "../context/useAuthContext";
import { getOpenGames } from "../utils/db/getOpenGames";

const navLinks = [
  { link: "Games", title: "GAMES" },
  { link: "Stats", title: "STATISTICS" },
  { link: "PlayerStats", title: "PLAYER STATS" },
  { link: "Matchups", title: "MATCHUPS" },
];

export default function CashHome({ navigation }: { navigation: any }) {
  const { session, canManage } = useAuthContext();

  const [openGame, setOpenGame] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (!session || !canManage) {
        setOpenGame(null);
        return;
      }
      getOpenGames().then((games) => {
        if (games.length) {
          const mostRecent = [...games].sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          setOpenGame(mostRecent);
        } else {
          setOpenGame(null);
        }
      });
    }, [session, canManage])
  );

  const handleCreateGamePress = () => {
    if (openGame) {
      navigation.navigate("OpenGame", { game: openGame });
    } else {
      navigation.navigate("Game");
    }
  };

  return (
    <Box h="100%" backgroundColor="black">
      <Box flex={1} w="100%" minH="100px">
        <Image style={{ width: "100%", height: "100%" }} source={require("../assets/logo.jpg")} />
      </Box>
      <Center flex={2} px={4}>
        <VStack space={4} alignItems="center" w="100%">
          {navLinks.map((item) => (
            <Button
              key={item.link}
              variant="solid"
              colorScheme="blueGray"
              width="90%"
              p="4"
              onPress={() => navigation.navigate(item.link)}
            >
              {item.title}
            </Button>
          ))}
          {canManage ? (
            <Button
              variant="solid"
              colorScheme={openGame ? "amber" : "emerald"}
              width="90%"
              p="4"
              mt={4}
              onPress={handleCreateGamePress}
            >
              {openGame ? "RESUME GAME" : "CREATE NEW GAME"}
            </Button>
          ) : null}
        </VStack>
      </Center>
      <Center pb={6} pt={2}>
        <IconButton
          variant="ghost"
          size="sm"
          borderRadius="full"
          icon={<Ionicons name="home" size={40} color="#94a3b8" />}
          onPress={() => navigation.navigate("Home")}
        />
      </Center>
    </Box>
  );
}
