import { supabase } from "../../lib/supabase";

export const releaseTournamentLock = async (tournamentId: number) => {
  try {
    const { error } = await supabase
      .from("tournaments")
      .update({ locked_by: null, locked_at: null })
      .eq("id", tournamentId);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.log("[ERROR] releaseTournamentLock() =>", error.message);
    return false;
  }
};
