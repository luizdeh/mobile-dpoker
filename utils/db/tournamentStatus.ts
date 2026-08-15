import { supabase } from "../../lib/supabase";

export const tournamentStatus = async (tournamentId: number, status: string) => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .update({ status })
      .eq("id", tournamentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] tournamentStatus() =>", error.message);
  }
};
