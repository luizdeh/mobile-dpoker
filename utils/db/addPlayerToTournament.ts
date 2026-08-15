import { supabase } from "../../lib/supabase";

export const addPlayerToTournament = async (tournamentId: number, personId: number) => {
  try {
    const { data, error } = await supabase
      .from("tournament_players")
      .insert({ tournament_id: tournamentId, person_id: personId })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] addPlayerToTournament() =>", error.message);
  }
};
