import { supabase } from "../../lib/supabase";

export const addDonation = async (person_id: number, amount: number, date: string) => {
  try {
    const { data, error } = await supabase
      .from("donations")
      .insert({ person_id, amount, date })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] addDonation() =>", error.message);
    return null;
  }
};
