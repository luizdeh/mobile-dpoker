import React, { useEffect, useRef, useState } from "react";
import { Center, VStack, Button, Box } from "native-base";
import { Image } from "react-native";
import { Video, ResizeMode } from "expo-av";

const navLinks = [
  { link: "Games", title: "GAMES" },
  { link: "Players", title: "PLAYERS" },
  { link: "Stats", title: "STATISTICS" },
  { link: "Matchups", title: "MATCHUPS" },
  { link: "Game", title: "CREATE NEW GAME" },
];

export default function HomeScreen({ navigation }: { navigation: any }) {
  const video = useRef(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setInterval(() => {
      setIsLoading(!isLoading);
    }, 1500);
  }, []);

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
                    colorScheme={idx === 4 ? "emerald" : "blueGray"}
                    width="90%"
                    p="4"
                    mt={idx === 4 ? 4 : 0}
                    onPress={() => navigation.navigate(name)}
                  >
                    {item.title}
                  </Button>
                );
              })}
            </VStack>
          </Center>
        </Box>
      )}
    </>
  );
}