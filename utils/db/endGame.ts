import { supabase } from "../../lib/supabase";

export const endGame = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("games")
      .update({ status: "CLOSED" })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] endGame() =>", error.message);
  }
};
