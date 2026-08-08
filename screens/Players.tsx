import { Entypo, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Box, Button, Center, HStack, IconButton, Input, Text, View, VStack } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import RegisteredPlayer from '../components/RegisteredPlayer';
import useGamesContext from '../context/useGamesContext';
import useAuthContext from '../context/useAuthContext';
import { type PlayerWithGames } from '../lib/types';


export default function PlayersList() {
  const { players, addNewPlayer, fetchPlayers, gamesPlayed, gamePlayers, setPlayers } = useGamesContext();
  const { canManage } = useAuthContext();

  const [showAddPlayerButton, setShowAddPlayerButton] = useState(false);
  const [name, setName] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'gp'>('name')

  const [gotPlayers, setGotPlayers] = useState(players?.map((item: any) => {
    const games = gamesPlayed?.filter((game: any) => game.playerIds.includes(item.id)).length
    // Checked against every game_players row (any status), since that's what
    // actually blocks deletion at the DB level — not just closed-game stats.
    const hasGameRecord = gamePlayers?.some((gp: any) => gp.person_id === item.id)
    return { ...item, games_played: games, hasGameRecord }
  })
    .sort((a, b) => a.name.localeCompare(b.name)))

  const handlePlayerDeleted = (id: number) => {
    setGotPlayers((prev) => prev?.filter((item: any) => item.id !== id));
    setPlayers?.((players ?? []).filter((item: any) => item.id !== id));
  };

  const ref = useRef<HTMLInputElement | null>(null);

  const onClear = () => {
    ref.current!.value = '';
    setName('');
    setShowAddPlayerButton(false);
    fetchPlayers()
  };

  const handleNewInput = (e: any) => {
    setName(e.target.value);
  };

  const filterino = ((player: any, games: any) => {
    return games.filter((game: any) => {
      return game.playerIds.includes(player.id);
    })
  })

  const handleSort = () =>
    sortBy === 'name'
      ? setGotPlayers((prev) => prev?.sort((a: any, b: any) => b.games_played - a.games_played))
      : setGotPlayers((prev) => prev?.sort((a: any, b: any) => a.name.localeCompare(b.name)))


  useEffect(() => {
    handleSort()
  }, [sortBy])

  return (
    <Box backgroundColor="black" px={4} py={2} flex={1}>
      {canManage ? (
      showAddPlayerButton ? (
        <Center>
          <HStack my={2} space={6} justifyItems="space-between" alignItems="center">
            <Input
              style={{
                height: 40,
                paddingLeft: 6,
                borderWidth: 1,
                backgroundColor: 'white',
              }}
              ref={ref}
              autoFocus={true}
              keyboardType="default"
              placeholder=" ... Daniel Negreanu"
              onChange={handleNewInput}
            />
            <IconButton
              _icon={{
                as: Entypo,
                name: 'erase',
                color: 'blueGray.400',
                size: 'lg',
              }}
              onPress={() => onClear()}
              isDisabled={!name.length}
            />
            <IconButton
              _icon={{
                as: MaterialIcons,
                name: 'clear',
                color: 'rose.400',
                size: 'xl',
              }}
              onPress={() => {
                setShowAddPlayerButton(false);
                onClear();
              }}
            />
          </HStack>
          <Button
            onPress={() => {
              addNewPlayer(name!, onClear);
            }}
            isDisabled={!name.length}
            width="80%"
            colorScheme="blueGray"
            my="2"
          >
            ADD NEW PLAYER
          </Button>
        </Center>
      ) : (
        <Center>
          <Button
            onPress={() => setShowAddPlayerButton(true)}
            width="80%"
            colorScheme="blueGray"
            variant="subtle"
            my="2"
          >
            ADD NEW PLAYER
          </Button>
        </Center>
      )
      ) : null}
      <Center py={4} alignItems="center" justifyContent="space-between">
        <Button onPress={() => { sortBy === 'name' ? setSortBy('gp') : setSortBy('name') }} width="80%" colorScheme="blueGray">{sortBy === 'name' ? 'SORT BY GAMES PLAYED' : 'SORT BY NAME'}</Button>
      </Center>
      <ScrollView>
        <VStack space={2} alignItems="center" width="100%">
          {gotPlayers ? (
            gotPlayers
              .map((item: PlayerWithGames, idx: number) => {
                return <RegisteredPlayer key={item.id} player={item} idx={idx} onDeleted={handlePlayerDeleted} />
              })
          ) : (
            <Text>No players registered yet.</Text>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}