import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeBaseProvider, extendTheme } from 'native-base';
import HomeScreen from './screens/Home';
import PlayersList from './screens/Players';
import OverallStats from './screens/Stats';
import Profile from './screens/Profile';
import Game from './screens/Game';
import ActiveGame from './screens/ActiveGame';
import GamesPlayed from './screens/GamesPlayed';
import Matchups from './screens/Matchups';
import { GamesContextProvider } from './context/GamesContext';

// Define the config
const config = {
  useSystemColorMode: false,
  initialColorMode: 'dark',
};

// extend the theme
export const theme = extendTheme({ config });
type MyThemeType = typeof theme;
declare module 'native-base' {
  interface ICustomTheme extends MyThemeType { }
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NativeBaseProvider>
      <GamesContextProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: 'white',
              },
              headerTintColor: '#0f766e',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 16,
              },
              headerTitleAlign: 'center',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Players" component={PlayersList} options={{ title: 'PLAYER LIST' }} />
            <Stack.Screen name="Stats" component={OverallStats} options={{ title: 'STATISTICS' }} />
            <Stack.Screen name="Profile" component={Profile} options={{ title: 'USER PROFILE' }} />
            <Stack.Screen name="Game" component={Game} options={{ title: 'CREATE A GAME' }} />
            <Stack.Screen name="Games" component={GamesPlayed} options={{ title: 'GAMES PLAYED' }} />
            <Stack.Screen name="Matchups" component={Matchups} options={{ title: 'MATCHUPS' }} />
            <Stack.Screen name="ActiveGame" component={ActiveGame} options={{ title: 'ACTIVE GAME' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </GamesContextProvider>
    </NativeBaseProvider>
  );
}
