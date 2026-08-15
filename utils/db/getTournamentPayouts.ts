import { supabase } from "../../lib/supabase";

export const getTournamentPayouts = async () => {
  try {
    const { data, error } = await supabase.from("tournament_payouts").select("*");
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] getTournamentPayouts() =>", error.message);
    return [];
  }
};
