import { supabase } from "../../lib/supabase";

export const updateGameRakeValue = async (gameId: number, rake_value: number) => {
  try {
    const { data, error } = await supabase
      .from("games")
      .update({ rake_value })
      .eq("id", gameId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(`[ERROR] updateGameRakeValue(${gameId}) => ${error.message}`);
    return { error };
  }
};
