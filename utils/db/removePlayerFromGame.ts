import { supabase } from "../../lib/supabase";

export const removePlayerFromGame = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase.from("game_players").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.log("[ERROR] removePlayerFromGame() =>", error.message);
    return false;
  }
};
