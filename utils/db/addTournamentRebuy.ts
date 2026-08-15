import { supabase } from "../../lib/supabase";

export const addTournamentRebuy = async (id: number) => {
  try {
    const { data: current, error: fetchError } = await supabase
      .from("tournament_players")
      .select("quantity_rebuy")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from("tournament_players")
      .update({ quantity_rebuy: current.quantity_rebuy + 1 })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] addTournamentRebuy() =>", error.message);
  }
};
