import { supabase } from "../../lib/supabase";

// Supabase caps select("*") at 1000 rows per request by default (db-max-rows).
// This table grows every game, so page through it instead of relying on a
// single request to return everything.
const PAGE_SIZE = 1000;

export const getGamePlayers = async () => {
  try {
    const allRows: any[] = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from("game_players")
        .select("*")
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allRows.push(...data);
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
    return allRows;
  } catch (error: any) {
    console.log("[ERROR] getGamePlayers() =>", error.message);
    return [];
  }
};
