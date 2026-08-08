import { supabase } from "../../lib/supabase";

export const releaseGameLock = async (gameId: number) => {
  try {
    const { error } = await supabase
      .from("games")
      .update({ locked_by: null, locked_at: null })
      .eq("id", gameId);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.log("[ERROR] releaseGameLock() =>", error.message);
    return false;
  }
};
