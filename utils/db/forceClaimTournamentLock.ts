import { supabase } from "../../lib/supabase";

// Unconditionally overwrites the lock, regardless of who holds it. Used as
// the explicit "take over anyway" recovery path for a tournament whose
// original device died mid-play and can never release its lock on its own.
export const forceClaimTournamentLock = async (tournamentId: number, deviceId: string) => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .update({ locked_by: deviceId, locked_at: new Date().toISOString() })
      .eq("id", tournamentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] forceClaimTournamentLock() =>", error.message);
    return null;
  }
};
