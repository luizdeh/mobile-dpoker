import { supabase } from "../../lib/supabase";

export const updateRakePaid = async (id: number, rake_paid: boolean) => {
  try {
    const { data, error } = await supabase
      .from("game_players")
      .update({ rake_paid })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(`[ERROR] updateRakePaid(${id}) => ${error.message}`);
    return { error };
  }
};
