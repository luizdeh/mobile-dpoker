import { supabase } from "../../lib/supabase";

export const removePlayerFromTournament = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase.from("tournament_players").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.log("[ERROR] removePlayerFromTournament() =>", error.message);
    return false;
  }
};
