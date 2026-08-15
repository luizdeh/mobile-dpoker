import React, { useMemo, useState } from "react";
import {
  Text,
  VStack,
  Button,
  HStack,
  Box,
  Input,
  Center,
  Pressable,
  Icon,
  useToast,
} from "native-base";
import { AntDesign } from "@expo/vector-icons";
import { createNewTournament } from "../utils/db/createNewTournament";
import { addPlayerToTournament } from "../utils/db/addPlayerToTournament";
import { useNavigation } from "@react-navigation/native";
import { PlayerList, TournamentParamsNavigation, TournamentParams } from "../lib/types";
import { ScrollView } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useGamesContext from "../context/useGamesContext";
import useTournamentsContext from "../context/useTournamentsContext";
import { getDeviceId } from "../lib/deviceId";

export default function NewTournament() {
  const { players } = useGamesContext();
  const { tournaments } = useTournamentsContext();
  const toast = useToast();

  const [playerList, setPlayerList] = useState<PlayerList[]>(
    (players ?? []).filter((item: PlayerList) => item.is_active === 1)
  );
  const [tournamentParams, setTournamentParams] = useState<TournamentParams>(() => {
    // Carries forward the most recent tournament's buy-in/re-buy so it only
    // has to be changed when it actually changes, same idea as rake_value on
    // the cash-game side.
    const mostRecent = tournaments?.length
      ? [...tournaments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null;
    return {
      buy_in_value: mostRecent?.buy_in_value ?? 100,
      re_buy_value: mostRecent?.re_buy_value ?? 100,
      status: "LOBBY",
    };
  });
  const [search, setSearch] = useState("");

  const navigation = useNavigation<NativeStackNavigationProp<TournamentParamsNavigation>>();

  const searchedPlayers = useMemo(
    () =>
      [...playerList]
        .filter((player: PlayerList) => player.name.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a: PlayerList, b: PlayerList) => a.name.localeCompare(b.name)),
    [playerList, search]
  );

  const selectedPlayers = useMemo(
    () =>
      [...playerList]
        .filter((player: PlayerList) => player.active === true)
        .sort((a: PlayerList, b: PlayerList) => a.name.localeCompare(b.name)),
    [playerList]
  );

  const toggleRegisterPlayer = (id: number) => {
    setPlayerList((prev) => {
      const updatedList = [...prev];
      const idx = updatedList.findIndex((item: PlayerList) => item.id === id);
      updatedList[idx] = { ...updatedList[idx], active: !updatedList[idx].active };
      return updatedList;
    });
  };

  const clearPlayers = () => {
    setPlayerList((prev) => prev.map((player) => ({ ...player, active: false })));
  };

  const startTournament = async () => {
    const deviceId = await getDeviceId();
    const { tournament: createdTournament, alreadyOpen } = await createNewTournament({
      ...tournamentParams,
      locked_by: deviceId,
      locked_at: new Date().toISOString(),
    });
    if (alreadyOpen) {
      toast.show({ description: "Another tournament was just opened. Redirecting you to it." });
      navigation.navigate("Home");
      return;
    }
    if (createdTournament) {
      for (const player of playerList) {
        if (player.active === true) await addPlayerToTournament(createdTournament.id, player.id);
      }
      navigation.navigate("ActiveTournament", {
        tournament: createdTournament,
        players: playerList,
      });
    }
  };

  const buyInValue = tournamentParams.buy_in_value.toLocaleString().replace(",", ".");
  const rebuyValue = tournamentParams.re_buy_value.toLocaleString().replace(",", ".");

  return (
    <Box backgroundColor="black" flex={1}>
      <VStack space={1} alignItems="center" flex={1} mt={4}>
        <HStack px={2} mb={4} space={1}>
          <VStack minW="70%" flex={1} borderRadius="lg" backgroundColor="blueGray.600" py={1} px={2} space={2}>
            <Text textAlign="center" color="blueGray.300" fontSize="xs" bold flex={1}>
              TOURNAMENT PARAMETERS
            </Text>
            <HStack flex={1} alignItems="center">
              <Text color="teal.300" fontSize="10" flex={2} bold>
                BUY-IN (R$)
              </Text>
              <Input
                size="xs"
                p={1}
                flex={1}
                textAlign="center"
                fontWeight="semibold"
                fontSize="10"
                variant="filled"
                color="teal.400"
                borderColor="blueGray.800"
                backgroundColor="blueGray.800"
                value={buyInValue}
                keyboardType="number-pad"
                onChangeText={(val) => {
                  const parsed = Number(val);
                  setTournamentParams((prev) => ({
                    ...prev,
                    buy_in_value: Number.isFinite(parsed) ? parsed : prev.buy_in_value,
                  }));
                }}
              />
            </HStack>
            <HStack flex={1} alignItems="center">
              <Text color="teal.300" fontSize="10" flex={2} bold>
                RE-BUY (R$)
              </Text>
              <Input
                size="xs"
                p={1}
                flex={1}
                textAlign="center"
                fontWeight="semibold"
                fontSize="10"
                variant="filled"
                color="teal.400"
                borderColor="blueGray.800"
                backgroundColor="blueGray.800"
                value={rebuyValue}
                keyboardType="number-pad"
                onChangeText={(val) => {
                  const parsed = Number(val);
                  setTournamentParams((prev) => ({
                    ...prev,
                    re_buy_value: Number.isFinite(parsed) ? parsed : prev.re_buy_value,
                  }));
                }}
              />
            </HStack>
          </VStack>
          <VStack minW="30%" flex={1} borderRadius="lg" backgroundColor="blueGray.600" px={1} pt={1} pb={0} space={2}>
            <VStack flex={1} alignItems="center" justifyContent="space-evenly">
              <Text fontSize="xs" color="blueGray.300" bold>
                PLAYERS
              </Text>
              <Text fontSize="4xl" color="teal.400">
                {selectedPlayers.length}
              </Text>
              <Button
                size="xs"
                variant="solid"
                width="80%"
                borderRadius="md"
                px={4}
                py={1}
                _text={{ fontSize: 10 }}
                isDisabled={!selectedPlayers.length}
                onPress={clearPlayers}
                colorScheme="teal"
              >
                CLEAR
              </Button>
            </VStack>
          </VStack>
        </HStack>
        <VStack style={{ width: "100%" }} flex={1} px={2}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="SEARCH PLAYERS"
            color="white"
            placeholderTextColor="blueGray.400"
            borderColor="blueGray.700"
            mb={2}
            InputRightElement={
              search ? (
                <Pressable onPress={() => setSearch("")} px={3} py={2}>
                  <Icon as={AntDesign} name="close" size="xs" color="blueGray.400" />
                </Pressable>
              ) : undefined
            }
          />
          {selectedPlayers.length ? (
            <HStack flexWrap="wrap" mb={2}>
              {selectedPlayers.map((player: PlayerList) => (
                <Button
                  key={player.id}
                  onPress={() => toggleRegisterPlayer(player.id)}
                  size="xs"
                  borderRadius="full"
                  colorScheme="teal"
                  variant="solid"
                  m={0.5}
                  rightIcon={<Icon as={AntDesign} name="close" size="2xs" />}
                >
                  {player.name.toUpperCase()}
                </Button>
              ))}
            </HStack>
          ) : null}
          <ScrollView style={{ flex: 1, width: "100%" }}>
            {searchedPlayers.map((player: PlayerList) => {
              const isSelected = player.active === true;
              return (
                <Pressable key={player.id} onPress={() => toggleRegisterPlayer(player.id)}>
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    px={3}
                    py={3}
                    borderBottomWidth={1}
                    borderColor="blueGray.800"
                    backgroundColor={isSelected ? "blueGray.800" : "transparent"}
                  >
                    <Text color={isSelected ? "teal.300" : "white"} bold={isSelected} fontSize="sm">
                      {player.name.toUpperCase()}
                    </Text>
                    {isSelected ? <Icon as={AntDesign} name="checkcircle" size="sm" color="teal.300" /> : null}
                  </HStack>
                </Pressable>
              );
            })}
            {!searchedPlayers.length ? (
              <Text textAlign="center" fontSize="xs" color="blueGray.400" mt={4}>
                No players match "{search}".
              </Text>
            ) : null}
          </ScrollView>
        </VStack>
      </VStack>
      <Box safeArea mt={2}>
        <Button
          isDisabled={selectedPlayers.length < 2}
          variant="solid"
          colorScheme="blueGray"
          width="100%"
          mb="0"
          minHeight="16"
          borderRadius="none"
          onPress={startTournament}
          _text={{ fontSize: "lg" }}
        >
          START TOURNAMENT
        </Button>
      </Box>
    </Box>
  );
}
