import { supabase } from "../../lib/supabase";

export const setRakeWaived = async (gameId: number, rake_waived: boolean) => {
  try {
    const { data, error } = await supabase
      .from("games")
      .update({ rake_waived })
      .eq("id", gameId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(`[ERROR] setRakeWaived(${gameId}) => ${error.message}`);
    return { error };
  }
};
