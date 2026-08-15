import { supabase } from "../../lib/supabase";

export const getOpenTournaments = async () => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .in("status", ["LOBBY", "ACTIVE"]);
    if (error) throw error;
    return data ?? [];
  } catch (error: any) {
    console.log("[ERROR] getOpenTournaments() =>", error.message);
    return [];
  }
};
