import { supabase } from "../../lib/supabase";

export const getTournamentPlayers = async () => {
  try {
    const { data, error } = await supabase.from("tournament_players").select("*");
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] getTournamentPlayers() =>", error.message);
    return [];
  }
};
