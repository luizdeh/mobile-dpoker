import React, { useEffect, useRef, useState } from "react";
import { Center, HStack, VStack, Button, Box, IconButton } from "native-base";
import { Image } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import useAuthContext from "../context/useAuthContext";

export default function HomeScreen({ navigation }: { navigation: any }) {
  const video = useRef(null);
  const { canManage } = useAuthContext();

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
              <Button
                variant="solid"
                colorScheme="blueGray"
                width="90%"
                p="4"
                onPress={() => navigation.navigate("CashHome")}
              >
                CASH GAMES
              </Button>
              <Button
                variant="solid"
                colorScheme="blueGray"
                bg="blueGray.800"
                _pressed={{ bg: "blueGray.700" }}
                width="90%"
                p="4"
                onPress={() => navigation.navigate("TournamentsHome")}
              >
                TOURNAMENTS
              </Button>
            </VStack>
          </Center>
          <Center pb={6} pt={2}>
            <HStack space={canManage ? 12 : 16} alignItems="center">
              <IconButton
                variant="ghost"
                size="sm"
                borderRadius="full"
                icon={<MaterialCommunityIcons name="piggy-bank-outline" size={40} color="#94a3b8" />}
                onPress={() => navigation.navigate("Cash")}
              />
              {canManage ? (
                <IconButton
                  variant="ghost"
                  size="sm"
                  borderRadius="full"
                  icon={<Ionicons name="people" size={40} color="#94a3b8" />}
                  onPress={() => navigation.navigate("Players")}
                />
              ) : null}
              <IconButton
                variant="ghost"
                size="sm"
                borderRadius="full"
                icon={<Ionicons name="settings-sharp" size={40} color="#94a3b8" />}
                onPress={() => navigation.navigate("Profile")}
              />
            </HStack>
          </Center>
        </Box>
      )}
    </>
  );
}
