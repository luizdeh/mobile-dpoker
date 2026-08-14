import { supabase } from "../../lib/supabase";

export const getExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error: any) {
    console.log("[ERROR] getExpenses() =>", error.message);
    return [];
  }
};
