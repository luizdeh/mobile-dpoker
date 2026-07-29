import { supabase } from "../../lib/supabase";

export const createNewGame = async (gameData: {}) => {
  try {
    const { data, error } = await supabase
      .from("games")
      .insert(gameData)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] createNewGame() =>", error.message);
  }
};
