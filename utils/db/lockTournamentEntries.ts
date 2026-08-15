import { supabase } from "../../lib/supabase";

export const lockTournamentEntries = async (tournamentId: number) => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .update({ entries_locked: true })
      .eq("id", tournamentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] lockTournamentEntries() =>", error.message);
  }
};
