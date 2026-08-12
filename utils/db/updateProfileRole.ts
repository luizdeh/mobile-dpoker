import { supabase } from "../../lib/supabase";

export const updateProfileRole = async (id: string, role: "admin" | "operator"): Promise<boolean> => {
  try {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.log("[ERROR] updateProfileRole() =>", error.message);
    return false;
  }
};
