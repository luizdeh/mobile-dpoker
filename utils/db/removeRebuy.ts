import { supabase } from "../../lib/supabase";

export const removeRebuy = async (id: number) => {
  try {
    const { data: current, error: fetchError } = await supabase
      .from("game_players")
      .select("quantity_rebuy")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from("game_players")
      .update({ quantity_rebuy: Math.max(current.quantity_rebuy - 1, 0) })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] removeRebuy() =>", error.message);
  }
};
