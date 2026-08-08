import { supabase } from "../../lib/supabase";

// Atomic compare-and-swap: only claims the lock if it's currently unheld or
// already held by this same device. If another device holds it, the WHERE
// clause matches zero rows and Postgres returns success with no data —
// that's how we detect "someone else has this game open" without a race.
export const claimGameLock = async (gameId: number, deviceId: string) => {
  try {
    const { data, error } = await supabase
      .from("games")
      .update({ locked_by: deviceId, locked_at: new Date().toISOString() })
      .eq("id", gameId)
      .or(`locked_by.is.null,locked_by.eq.${deviceId}`)
      .select();
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error: any) {
    console.log("[ERROR] claimGameLock() =>", error.message);
    return null;
  }
};
