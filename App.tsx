import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeBaseProvider, extendTheme } from "native-base";
import { Image } from "react-native";
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

const LogoTitle = () => (
  <Image
    style={{ width: 100, height: 50 }}
    source={require("./assets/logo.jpg")}
  />
);

export default function App() {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: "black",
            },
            headerTintColor: "#0f0",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 14,
            },
            // headerRight: () => <LogoTitle />,
            headerTitleAlign: "center",
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "HOME" }}
          />
          <Stack.Screen
            name="Players"
            component={PlayersList}
            options={{ title: "PLAYER LIST" }}
          />
          <Stack.Screen
            name="Stats"
            component={OverallStats}
            options={{ title: "STATISTICS" }}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ title: "USER PROFILE" }}
          />
          <Stack.Screen
            name="Game"
            component={Game}
            options={{ title: "CREATE A GAME" }}
          />
          <Stack.Screen
            name="Games"
            component={GamesPlayed}
            options={{ title: "GAMES PLAYED" }}
          />
          <Stack.Screen
            name="Matchups"
            component={Matchups}
            options={{ title: "MATCHUPS" }}
          />
          <Stack.Screen
            name="Active Game"
            component={ActiveGame}
            options={{ title: "ACTIVE GAME" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
