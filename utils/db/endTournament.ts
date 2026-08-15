import { supabase } from "../../lib/supabase";

export const endTournament = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .update({ status: "CLOSED" })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] endTournament() =>", error.message);
  }
};
