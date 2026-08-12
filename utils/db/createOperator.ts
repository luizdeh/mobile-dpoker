import { supabase } from "../../lib/supabase";

export const createOperator = async (
  email: string,
  password: string,
  role: "admin" | "operator",
  displayName?: string
): Promise<{ error: string | null }> => {
  const { data, error } = await supabase.functions.invoke("create-operator", {
    body: { email, password, role, display_name: displayName },
  });
  if (error) {
    // The function returns a JSON body like { error: "..." } on failure;
    // supabase-js doesn't parse that into error.message automatically.
    const context = (error as any)?.context;
    const bodyMessage = typeof context?.json === "function" ? (await context.json().catch(() => null))?.error : null;
    return { error: bodyMessage ?? error.message };
  }
  if (data?.error) return { error: data.error };
  return { error: null };
};
