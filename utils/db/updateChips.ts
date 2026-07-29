import { supabase } from "../../lib/supabase";

export const updateChips = async (id: number, chips: number) => {
  try {
    const { data, error } = await supabase
      .from("game_players")
      .update({ chips })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(`[ERROR] updateChips(${id}) => ${error.message}`);
    return { error };
  }
};
