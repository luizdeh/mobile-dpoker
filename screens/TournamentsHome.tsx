import React, { useCallback, useState } from "react";
import { Box, Center, VStack, Button, IconButton, useToast } from "native-base";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import useAuthContext from "../context/useAuthContext";
import useGamesContext from "../context/useGamesContext";
import { getOpenTournaments } from "../utils/db/getOpenTournaments";
import { getTournamentPlayers } from "../utils/db/getTournamentPlayers";
import { claimTournamentLock } from "../utils/db/claimTournamentLock";
import { getDeviceId } from "../lib/deviceId";

export default function TournamentsHome({ navigation }: { navigation: any }) {
  const { session, canManage } = useAuthContext();
  const { players } = useGamesContext();
  const toast = useToast();

  const [openTournament, setOpenTournament] = useState<any>(null);
  const [isResuming, setIsResuming] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!session || !canManage) {
        setOpenTournament(null);
        return;
      }
      getOpenTournaments().then((tournaments) => {
        if (tournaments.length) {
          const mostRecent = [...tournaments].sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          setOpenTournament(mostRecent);
        } else {
          setOpenTournament(null);
        }
      });
    }, [session, canManage])
  );

  const handleCreateOrResumePress = async () => {
    if (!openTournament) {
      navigation.navigate("Tournament");
      return;
    }
    setIsResuming(true);
    const deviceId = await getDeviceId();
    const claimed = await claimTournamentLock(openTournament.id, deviceId);
    if (!claimed) {
      setIsResuming(false);
      toast.show({ description: "This tournament is currently open on another device." });
      return;
    }
    const entries = await getTournamentPlayers();
    const enteredIds = new Set(
      (entries ?? []).filter((item: any) => item.tournament_id === openTournament.id).map((item: any) => item.person_id)
    );
    const annotatedPlayers = (players ?? []).map((p: any) => ({ ...p, active: enteredIds.has(p.id) }));
    setIsResuming(false);
    navigation.navigate("ActiveTournament", { tournament: claimed, players: annotatedPlayers });
  };

  return (
    <Box h="100%" backgroundColor="black">
      <Box flex={1} w="100%" minH="100px">
        <Image style={{ width: "100%", height: "100%" }} source={require("../assets/logo.jpg")} />
      </Box>
      <Center flex={2} px={4}>
        <VStack space={4} alignItems="center" w="100%">
          <Button
            variant="solid"
            colorScheme="blueGray"
            bg="blueGray.800"
            _pressed={{ bg: "blueGray.700" }}
            width="90%"
            p="4"
            onPress={() => navigation.navigate("TournamentsPlayed")}
          >
            TOURNAMENTS PLAYED
          </Button>
          <Button
            variant="solid"
            colorScheme="blueGray"
            bg="blueGray.800"
            _pressed={{ bg: "blueGray.700" }}
            width="90%"
            p="4"
            onPress={() => navigation.navigate("TournamentStatistics")}
          >
            STATISTICS
          </Button>
          <Button
            variant="solid"
            colorScheme="blueGray"
            bg="blueGray.800"
            _pressed={{ bg: "blueGray.700" }}
            width="90%"
            p="4"
            onPress={() => navigation.navigate("TournamentPlayerStats")}
          >
            PLAYER STATS
          </Button>
          {canManage ? (
            <Button
              variant="solid"
              colorScheme={openTournament ? "amber" : "emerald"}
              bg={openTournament ? "amber.700" : "emerald.700"}
              _pressed={{ bg: openTournament ? "amber.600" : "emerald.600" }}
              width="90%"
              p="4"
              mt={4}
              isLoading={isResuming}
              onPress={handleCreateOrResumePress}
            >
              {openTournament ? "RESUME TOURNAMENT" : "CREATE NEW TOURNAMENT"}
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
