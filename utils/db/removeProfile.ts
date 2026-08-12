import { supabase } from "../../lib/supabase";

// Revokes app access by deleting the profiles row. Does not delete the
// underlying auth.users login -- that stays manageable from Authentication >
// Users in the dashboard if it needs to go away entirely.
export const removeProfile = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.log("[ERROR] removeProfile() =>", error.message);
    return false;
  }
};
