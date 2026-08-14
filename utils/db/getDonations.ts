import { supabase } from "../../lib/supabase";

export const getDonations = async () => {
  try {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (error: any) {
    console.log("[ERROR] getDonations() =>", error.message);
    return [];
  }
};
