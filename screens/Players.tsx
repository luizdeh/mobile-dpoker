import React, { useEffect, useState } from "react";
import { Text, Center, VStack } from "native-base";
import { getPlayers } from "../utils/fetchPlayers";

export default function PlayersList() {
  const [playerList, setPlayerList] = useState([]);

  useEffect(() => {
    (async () => {
      const players = await getPlayers();
      if (players) setPlayerList(players);
    })();
  }, []);

  return (
    <Center
      _dark={{ bg: "blueGray.900" }}
      _light={{ bg: "blueGray.50" }}
      px={4}
      flex={1}
    >
      <VStack space={3} alignItems="center">
        {playerList ? (
          playerList.map((item: any) => {
            return <Text key={item.id}>{item.name}</Text>;
          })
        ) : (
          <Text>No players registered yet.</Text>
        )}
      </VStack>
    </Center>
  );
}
