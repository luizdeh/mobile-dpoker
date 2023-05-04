import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  Center,
  VStack,
  Button,
  Box,
  IconButton,
  HStack,
  Input,
  Divider,
} from "native-base";
import { getPlayers } from "../utils/fetchPlayers";
import { addPlayer } from "../utils/addPlayer";
import { MaterialIcons } from "@expo/vector-icons";
import { PlayerList } from "../lib/types";
import RegisteredPlayer from "../components/RegisteredPlayer";

export default function PlayersList() {
  const [playerList, setPlayerList] = useState<PlayerList[]>([]);
  const [refState, setRefState] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);

  const onClear = () => {
    ref.current.value = "";
    setRefState(false);
  };

  const handleNewInput = () => {
    const player = ref.current;
    if (player?.value) setRefState(true);
  };

  useEffect(() => {
    (async () => {
      const players = await getPlayers();
      if (players) setPlayerList(players);
    })();
  }, []);

  const addPerson = async () => {
    const name = ref.current?.value;
    if (name) {
      await addPlayer(name);
      const players = await getPlayers();
      if (players) setPlayerList(players);
    }
    onClear();
  };

  return (
    <Box
      _dark={{ bg: "blueGray.900" }}
      _light={{ bg: "blueGray.50" }}
      px={4}
      py={2}
      flex={1}
    >
      <Center>
        <HStack
          my={2}
          space={6}
          justifyItems="space-between"
          alignItems="center"
        >
          <Input
            style={{
              height: 40,
              paddingLeft: 6,
              borderWidth: 1,
              backgroundColor: "white",
            }}
            ref={ref}
            autoFocus={true}
            keyboardType="default"
            placeholder=" ... Daniel Negreanu"
            onChange={handleNewInput}
          />
          <IconButton
            _icon={{
              as: MaterialIcons,
              name: "cancel",
              color: "rose.400",
              size: "lg",
            }}
            onPress={() => onClear()}
            isDisabled={!refState}
          />
        </HStack>
        <Button
          onPress={() => addPerson()}
          isDisabled={!refState}
          width="80%"
          colorScheme="blueGray"
          my="2"
        >
          ADD NEW PLAYER
        </Button>
      </Center>
      <Divider
        my="2"
        _light={{
          bg: "muted.600",
        }}
        _dark={{
          bg: "muted.50",
        }}
      />
      <br />
      <br />
      <VStack space={2} alignItems="center" width="100%">
        {playerList ? (
          playerList.map((item: PlayerList) => (
            <RegisteredPlayer
              key={item.id}
              player={item}
              updatePlayers={setPlayerList}
            />
          ))
        ) : (
          <Text>No players registered yet.</Text>
        )}
      </VStack>
    </Box>
  );
}
