import { supabase } from "../../lib/supabase";

// finish_position: 1 = champion, N = first player eliminated. Callers work
// out the position to assign (counting down from the entrant count) before
// calling this — it's a plain write, no business logic here.
export const eliminatePlayer = async (id: number, finish_position: number) => {
  try {
    const { data, error } = await supabase
      .from("tournament_players")
      .update({ finish_position })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.log(`[ERROR] eliminatePlayer(${id}) => ${error.message}`);
    return { error };
  }
};
