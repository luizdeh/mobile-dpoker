import React, { useEffect, useState } from "react";
import {
  Text,
  Center,
  Box,
  Spinner,
  VStack,
  HStack,
  Button,
} from "native-base";
import { getAllGames } from "../utils/getAllGames";
import { getPlayers } from "../utils/fetchPlayers";
import { Game, GamePlayer, Player, PlayerList } from "../lib/types";
import { getGamePlayers } from "../utils/getGamePlayers";
import { ScrollView } from "react-native";
import { IconButton } from "native-base";
import { Entypo } from "@expo/vector-icons";
import GameScoreboard from "../components/GameScoreboard";
import PlayersCheckboxes from "../components/PlayersCheckboxes";

export default function GamesPlayed() {
  const [isLoading, setIsLoading] = useState(true);

  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<PlayerList[]>([]);
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);

  const [initialFetch, setInitialFetch] = useState(false);

  const [stats, setStats] = useState<any[]>([]);

  const [showLegends, setShowLegends] = useState(false);

  const [filteredStats, setFilteredStats] = useState<any[]>([]);

  const [playerCheckboxes, setPlayerCheckboxes] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const fetchPlayers = await getPlayers();
      if (fetchPlayers) setPlayers(fetchPlayers);

      const fetchGames = await getAllGames();
      if (fetchGames)
        setGames(fetchGames.filter((game: Game) => game.status === "CLOSED"));

      const fetchGamePlayers = await getGamePlayers();
      if (fetchGamePlayers) setGamePlayers(fetchGamePlayers);

      if (fetchGames.length && fetchPlayers.length && fetchGamePlayers.length)
        setInitialFetch(true);
    })();
  }, []);

  useEffect(() => {
    if (initialFetch) {
      const gamesPlayed = games.map((game: Game) => {
        const game_played = gamePlayers.filter(
          (item: GamePlayer) => item.game_id === game.id
        );
        let sum_of_chips = 0;
        game_played.length >= 1
          ? (sum_of_chips = game_played.reduce((a, b) => a + b.chips, 0))
          : 0;
        const active_players = game_played.map((player: GamePlayer) => {
          const equity = player.chips / sum_of_chips || 0;
          const investment =
            (game.buy_in_value + player.quantity_rebuy * game.re_buy_value) *
            game.chip_value;
          const name = players.find(
            (playerName: PlayerList) => playerName.id === player.person_id
          )?.name;
          const prize = player.chips * game.chip_value;
          const profit = prize - investment;
          return { ...player, equity, investment, name, prize, profit };
        });
        const playerIds = active_players.map((item: any) => item.person_id);
        return { ...game, active_players, sum_of_chips, playerIds };
      });
      setStats(gamesPlayed);

      const checkbox = players.map((player: PlayerList) => {
        return { id: player.id, name: player.name, checkbox: false };
      });
      setPlayerCheckboxes(checkbox);
    }
  }, [initialFetch]);

  useEffect(() => {
    if (stats.length) {
      setFilteredStats(stats);
      setIsLoading(false);
    }
  }, [stats]);

  useEffect(() => {
    const temp = [...playerCheckboxes];
    const updated = temp
      .filter((item: any) => item.checkbox)
      .map((subItem: any) => subItem.id);

    const filter = stats.filter((game: any) => {
      const playerIds = game.playerIds;
      return updated.every((playerId: number) => playerIds.includes(playerId));
    });

    setFilteredStats(filter);
  }, [playerCheckboxes]);

  const cleanCheckboxes = () => {
    const updatedCheckboxes = playerCheckboxes.map((checkbox: any) => {
      return { ...checkbox, checkbox: false };
    });
    setPlayerCheckboxes(updatedCheckboxes);
  };

  const renderCheckedPlayerScores = () => {
    const temp = [...playerCheckboxes];
    const updated = temp
      .filter((item: any) => item.checkbox)
      .map((subItem: any) => subItem.id);

    const players = filteredStats.flatMap((game: any) => {
      const each = updated.flatMap((item: any) =>
        game.active_players.find(
          (subItem: Player) => subItem.person_id === item
        )
      );
      return each;
    });

    const summedObjects = players.reduce((result, obj) => {
      if (!obj || !("person_id" in obj)) return result;
      const { person_id, ...rest } = obj;
      if (!result[person_id]) {
        result[person_id] = { person_id, ...rest };
      } else {
        for (const key in rest) {
          if (
            Object.prototype.hasOwnProperty.call(rest, key) &&
            typeof rest[key] === "number"
          ) {
            result[person_id][key] = (result[person_id][key] || 0) + rest[key];
          }
        }
      }
      return result;
    }, {});
    const summedArray = Object.values(summedObjects).sort(
      (a: any, b: any) => b.profit - a.profit
    );

    return summedArray.map((item: any, idx: number) => {
      const [name, ...lastName] = item.name.split(" ").filter(Boolean);
      const myName =
        lastName.length && item.name.length >= 11
          ? `${name} ${lastName[0][0]}.`
          : `${name} ${lastName}`;
      return (
        <HStack
          key={idx}
          py={1}
          backgroundColor={idx % 2 === 0 ? "white" : "blueGray.100"}
        >
          <Text flex={2} fontSize="xs">
            {myName.toUpperCase()}
          </Text>
          <Text flex={1} fontSize="xs" textAlign="center">
            {item.quantity_rebuy}
          </Text>
          <Text flex={1} fontSize="xs" textAlign="center">
            {item.profit.toFixed(2)}
          </Text>
          <Text flex={1} fontSize="xs" textAlign="center">
            {(item.equity / filteredStats.length).toFixed(2)}
          </Text>
        </HStack>
      );
    });
  };

  return (
    <Box h="100%" px="4" py="2" backgroundColor="white">
      {isLoading ? (
        <Center flex={1}>
          <Spinner size="lg" color="emerald.600" />
        </Center>
      ) : (
        <>
          <Box flexDirection="row" flexWrap="wrap">
            {playerCheckboxes.map((player: PlayerList) => {
              return (
                <PlayersCheckboxes
                  key={player.id}
                  player={player}
                  updateCheckboxes={setPlayerCheckboxes}
                />
              );
            })}
          </Box>
          <br />
          <VStack px={2}>
            <HStack justifyItems="center">
              <Text>Games found: </Text>
              <Text bold>{filteredStats.length} </Text>
              <Text>/ {stats.length}</Text>
            </HStack>
            <Button
              isDisabled={
                playerCheckboxes.some((item: any) => item.checkbox == true)
                  ? false
                  : true
              }
              onPress={cleanCheckboxes}
              variant="solid"
              colorScheme="blueGray"
              width="100%"
              my="2"
              minHeight="10"
              borderRadius="none"
            >
              CLEAN SEARCH
            </Button>
            {playerCheckboxes.some((item: any) => item.checkbox == true) ? (
              <HStack borderBottomColor="black" borderBottomWidth="1" mt="4">
                <Text flex={2} fontSize="xs" bold>
                  PLAYER
                </Text>
                <Text flex={1} fontSize="xs" textAlign="center" bold>
                  REBUYS
                </Text>
                <Text flex={1} fontSize="xs" textAlign="center" bold>
                  PROFIT
                </Text>
                <Text flex={1} fontSize="xs" textAlign="center" bold>
                  EQUITY
                </Text>
              </HStack>
            ) : null}
            {filteredStats.length ? (
              renderCheckedPlayerScores()
            ) : (
              <Text textAlign="center" fontSize="xs" my="1">
                No games played between selected players.
              </Text>
            )}
          </VStack>
        </>
      )}
    </Box>
  );
}
