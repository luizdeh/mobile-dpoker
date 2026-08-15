import { useContext } from "react";
import { TournamentsContext } from "./TournamentsContext";

export default function useTournamentsContext() {
  const context = useContext(TournamentsContext);
  if (!context) {
    throw new Error("useContext must be used within a TournamentsContextProvider");
  }
  return context
}
