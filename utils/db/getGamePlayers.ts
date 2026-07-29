import { supabase } from "../../lib/supabase";

export const getGamePlayers = async () => {
  try {
    const { data, error } = await supabase.from("game_players").select("*");
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] getGamePlayers() =>", error.message);
    return [];
  }
};
