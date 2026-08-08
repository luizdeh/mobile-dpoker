import { supabase } from "../../lib/supabase";

// Unconditionally overwrites the lock, regardless of who holds it. Used as
// the explicit "take over anyway" recovery path for a game whose original
// device died mid-play and can never release its lock on its own.
export const forceClaimGameLock = async (gameId: number, deviceId: string) => {
  try {
    const { data, error } = await supabase
      .from("games")
      .update({ locked_by: deviceId, locked_at: new Date().toISOString() })
      .eq("id", gameId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] forceClaimGameLock() =>", error.message);
    return null;
  }
};
