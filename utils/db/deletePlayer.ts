import { supabase } from "../../lib/supabase";

export const deletePlayer = async (id: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.from("players").delete().eq("id", id).select();
    if (error) throw error;
    // RLS silently excludes rows the delete policy doesn't allow instead of
    // erroring, so an empty result means nothing was actually deleted.
    if (!data || data.length === 0) {
      return { success: false, error: "You don't have permission to delete this player." };
    }
    return { success: true };
  } catch (error: any) {
    console.log("[ERROR] deletePlayer() =>", error.message);
    if (error.code === "23503") {
      return { success: false, error: "This player has games on record and can't be deleted." };
    }
    return { success: false, error: "Failed to delete player. Please try again." };
  }
};
