import { supabase } from "../../lib/supabase";

export const addPlayerToGame = async (gameId: number, personId: number) => {
  try {
    const { data, error } = await supabase
      .from("game_players")
      .insert({ game_id: gameId, person_id: personId })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] addPlayerToGame() =>", error.message);
  }
};
