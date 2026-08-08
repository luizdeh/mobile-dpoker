import { supabase } from "../../lib/supabase";

export const deleteGame = async (id: number) => {
  try {
    const { data, error } = await supabase.from("games").delete().eq("id", id).select();
    if (error) throw error;
    // RLS silently excludes rows the delete policy doesn't allow instead of
    // erroring, so an empty result means nothing was actually deleted.
    if (!data || data.length === 0) {
      throw new Error("No game was deleted — check delete permissions.");
    }
    return true;
  } catch (error: any) {
    console.log("[ERROR] deleteGame() =>", error.message);
    return false;
  }
};
