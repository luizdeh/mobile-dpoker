import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeBaseProvider, extendTheme } from "native-base";
import HomeScreen from "./screens/Home";
import PlayersList from "./screens/Players";
import OverallStats from "./screens/Stats";
import Profile from "./screens/Profile";
import Game from "./screens/Game";
import ActiveGame from "./screens/ActiveGame";
import GamesPlayed from "./screens/GamesPlayed";
import Matchups from "./screens/Matchups";

// Define the config
const config = {
  useSystemColorMode: false,
  initialColorMode: "dark",
};

// extend the theme
export const theme = extendTheme({ config });
type MyThemeType = typeof theme;
declare module "native-base" {
  interface ICustomTheme extends MyThemeType { }
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Players" component={PlayersList} />
          <Stack.Screen name="Stats" component={OverallStats} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Game" component={Game} />
          <Stack.Screen name="Games" component={GamesPlayed} />
          <Stack.Screen name="Matchups" component={Matchups} />
          <Stack.Screen
            name="Active Game"
            component={ActiveGame}
            options={{ title: "Active Game" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
