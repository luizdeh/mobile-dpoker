import { supabase } from "../../lib/supabase";

export const getPlayers = async () => {
  try {
    const { data, error } = await supabase.from("players").select("*");
    if (error) throw error;
    return data.map((item: any) => ({
      ...item,
      active: false,
      is_active: item.is_active ? 1 : 0,
    }));
  } catch (error: any) {
    console.log("[ERROR] getPlayers() =>", error.message);
    return [];
  }
};
