import { supabase } from "../../lib/supabase";

export const updatePlayer = async (id: number, name: string) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .update({ name })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] updatePlayer() =>", error.message);
  }
};
