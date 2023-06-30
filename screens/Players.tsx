import React, { useContext, useRef, useState } from 'react';
import { Text, Center, VStack, Button, Box, IconButton, HStack, Input } from 'native-base';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import { PlayerList } from '../lib/types';
import RegisteredPlayer from '../components/RegisteredPlayer';
import { ScrollView } from 'react-native';
import { GamesContext } from '../context/GamesContext';

export default function PlayersList() {
  const { players, addNewPlayer } = useContext(GamesContext);

  const [showAddPlayerButton, setShowAddPlayerButton] = useState(false);
  const [name, setName] = useState('');
  const ref = useRef<HTMLInputElement | null>(null);

  const onClear = () => {
    ref.current!.value = '';
    setName('');
  };

  const handleNewInput = (e: any) => {
    setName(e.target.value);
  };

  return (
    <Box backgroundColor="black" px={4} py={2} flex={1}>
      {showAddPlayerButton ? (
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
      )}
      <br />
      <ScrollView>
        <VStack space={2} alignItems="center" width="100%">
          {players ? (
            players
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((item: PlayerList) => <RegisteredPlayer key={item.id} player={item} />)
          ) : (
            <Text>No players registered yet.</Text>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
