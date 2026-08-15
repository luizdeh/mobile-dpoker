import { supabase } from "../../lib/supabase";

export const setTournamentPrize = async (id: number, prize_amount: number, is_split: boolean) => {
  try {
    const { data, error } = await supabase
      .from("tournament_players")
      .update({ prize_amount, is_split })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(`[ERROR] setTournamentPrize(${id}) => ${error.message}`);
    return { error };
  }
};
