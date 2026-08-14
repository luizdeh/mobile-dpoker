import { supabase } from "../../lib/supabase";

export const addExpense = async (description: string, amount: number, date: string) => {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .insert({ description, amount, date })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log("[ERROR] addExpense() =>", error.message);
    return null;
  }
};
