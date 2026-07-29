import { supabase } from "../../lib/supabase";

export const gameStatus = async (gameId: number, status: string) => {
  try {
    const { data, error } = await supabase
      .from("games")
      .update({ status })
      .eq("id", gameId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] gameStatus() =>", error.message);
  }
};
