import React, { useCallback, useEffect, useRef, useState } from "react";
import { Center, VStack, Button, Box, IconButton } from "native-base";
import { Image } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import useAuthContext from "../context/useAuthContext";
import { getOpenGames } from "../utils/db/getOpenGames";

const baseNavLinks = [
  { link: "Games", title: "GAMES" },
  { link: "Stats", title: "STATISTICS" },
  { link: "Matchups", title: "MATCHUPS" },
];

export default function HomeScreen({ navigation }: { navigation: any }) {
  const video = useRef(null);
  const { session, canManage } = useAuthContext();

  const navLinks = baseNavLinks;

  const [isLoading, setIsLoading] = useState(true);
  const [openGame, setOpenGame] = useState<any>(null);

  useEffect(() => {
    setInterval(() => {
      setIsLoading(!isLoading);
    }, 1500);
  }, []);

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
    <>
      {isLoading ? (
        <Box h="100%" w="100%" backgroundColor="black">
          <Center flex={1} maxHeight="453">
            <Video
              ref={video}
              source={require("../assets/animation.mp4")}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              style={{ width: 254, height: 453, flex: 1 }}
              useNativeControls={false}
              isMuted={true}
            />
          </Center>
        </Box>
      ) : (
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
                    colorScheme={item.highlight ? "emerald" : "blueGray"}
                    width="90%"
                    p="4"
                    mt={item.highlight ? 4 : 0}
                    onPress={() => navigation.navigate(name)}
                  >
                    {item.title}
                  </Button>
                );
              })}
              {canManage && openGame ? (
                <Button
                  variant="solid"
                  colorScheme="amber"
                  width="90%"
                  p="4"
                  mt={4}
                  onPress={() => navigation.navigate("OpenGame", { game: openGame })}
                >
                  RESUME GAME
                </Button>
              ) : null}
              {canManage ? (
                <Button
                  variant="solid"
                  colorScheme="emerald"
                  width="90%"
                  p="4"
                  mt={4}
                  onPress={handleCreateGamePress}
                >
                  CREATE NEW GAME
                </Button>
              ) : null}
              {canManage ? (
                <Button
                  variant="solid"
                  colorScheme="blueGray"
                  width="90%"
                  p="4"
                  mt={8}
                  onPress={() => navigation.navigate("Players")}
                >
                  PLAYERS
                </Button>
              ) : null}
            </VStack>
          </Center>
          <Center pb={6} pt={2}>
            <IconButton
              variant="ghost"
              size="sm"
              borderRadius="full"
              icon={<Ionicons name="settings-sharp" size={40} color="#94a3b8" />}
              onPress={() => navigation.navigate("Profile")}
            />
          </Center>
        </Box>
      )}
    </>
  );
}