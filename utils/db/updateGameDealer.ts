import { supabase } from "../../lib/supabase";

// dealer_id null = no dealer for this game (everyone pays rake).
export const updateGameDealer = async (gameId: number, dealer_id: number | null) => {
  try {
    const { data, error } = await supabase
      .from("games")
      .update({ dealer_id })
      .eq("id", gameId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(`[ERROR] updateGameDealer(${gameId}) => ${error.message}`);
    return { error };
  }
};
