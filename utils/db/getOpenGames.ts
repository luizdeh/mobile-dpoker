import { supabase } from "../../lib/supabase";

export const getOpenGames = async () => {
  try {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .in("status", ["LOBBY", "ACTIVE"]);
    if (error) throw error;
    return data ?? [];
  } catch (error: any) {
    console.log("[ERROR] getOpenGames() =>", error.message);
    return [];
  }
};
