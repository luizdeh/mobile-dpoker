import { useContext } from "react";
import { GamesContext } from "./GamesContext";

export default function useGamesContext() {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error("useContext must be used within a GamesContextProvider");
  }
  return context
}