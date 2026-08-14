import { supabase } from "../../lib/supabase";

export const deleteDonation = async (id: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from("donations").delete().eq("id", id).select();
    if (error) throw error;
    // RLS silently excludes rows the delete policy doesn't allow instead of
    // erroring, so an empty result means nothing was actually deleted.
    if (!data || data.length === 0) {
      throw new Error("No donation was deleted — check delete permissions.");
    }
    return true;
  } catch (error: any) {
    console.log("[ERROR] deleteDonation() =>", error.message);
    return false;
  }
};
