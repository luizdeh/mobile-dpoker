import { supabase } from "../../lib/supabase";

export const createNewGame = async (gameData: {}): Promise<{ game: any; alreadyOpen: boolean }> => {
  try {
    const { data, error } = await supabase
      .from("games")
      .insert(gameData)
      .select()
      .single();
    if (error) throw error;
    return { game: data, alreadyOpen: false };
  } catch (error: any) {
    console.log("[ERROR] createNewGame() =>", error.message);
    // 23505 = unique_violation, thrown by the games_single_open_game index
    // when another game is already open.
    return { game: null, alreadyOpen: error.code === "23505" };
  }
};
