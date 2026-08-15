import { supabase } from "../../lib/supabase";

export const createNewTournament = async (tournamentData: {}): Promise<{ tournament: any; alreadyOpen: boolean }> => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .insert(tournamentData)
      .select()
      .single();
    if (error) throw error;
    return { tournament: data, alreadyOpen: false };
  } catch (error: any) {
    console.log("[ERROR] createNewTournament() =>", error.message);
    // 23505 = unique_violation, thrown by the tournaments_single_open index
    // when another tournament is already open.
    return { tournament: null, alreadyOpen: error.code === "23505" };
  }
};
