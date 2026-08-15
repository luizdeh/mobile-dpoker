import { supabase } from "../../lib/supabase";

export const getAllTournaments = async () => {
  try {
    const { data, error } = await supabase.from("tournaments").select("*");
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] getAllTournaments() =>", error.message);
    return [];
  }
};
