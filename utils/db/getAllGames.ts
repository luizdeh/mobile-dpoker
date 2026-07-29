import { supabase } from "../../lib/supabase";

export const getAllGames = async () => {
  try {
    const { data, error } = await supabase.from("games").select("*");
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] getAllGames() =>", error.message);
    return [];
  }
};
