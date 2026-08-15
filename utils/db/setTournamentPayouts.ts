import { supabase } from "../../lib/supabase";

// Replaces the full payout structure for a tournament in one call — simpler
// than upserting individual rows, and this only ever runs once per
// tournament (at close-out), so there's no concurrent-edit risk to worry
// about.
export const setTournamentPayouts = async (
  tournamentId: number,
  payouts: { position: number; percentage: number }[]
) => {
  try {
    const { error: deleteError } = await supabase
      .from("tournament_payouts")
      .delete()
      .eq("tournament_id", tournamentId);
    if (deleteError) throw deleteError;

    const { data, error } = await supabase
      .from("tournament_payouts")
      .insert(payouts.map((p) => ({ tournament_id: tournamentId, ...p })))
      .select();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(`[ERROR] setTournamentPayouts(${tournamentId}) => ${error.message}`);
    return { error };
  }
};
