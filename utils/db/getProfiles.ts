import { supabase } from "../../lib/supabase";
import { Profile } from "../../lib/types";

export const getProfiles = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  } catch (error: any) {
    console.log("[ERROR] getProfiles() =>", error.message);
    return [];
  }
};
