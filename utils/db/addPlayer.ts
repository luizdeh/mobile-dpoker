import { supabase } from "../../lib/supabase";

export const addPlayer = async (name: string) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .insert({ name })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] addPlayer() =>", error.message);
  }
};
