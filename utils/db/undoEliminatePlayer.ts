import { supabase } from "../../lib/supabase";

export const undoEliminatePlayer = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("tournament_players")
      .update({ finish_position: null })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(`[ERROR] undoEliminatePlayer(${id}) => ${error.message}`);
    return { error };
  }
};
