// Creates a new operator/admin login with an admin-supplied password (no
// invite email). Runs server-side because creating an auth.users row
// requires the service-role key, which must never ship to the client.
// Supabase injects SUPABASE_URL / SUPABASE_ANON_KEY /
// SUPABASE_SERVICE_ROLE_KEY into every Edge Function automatically -- no
// manual secret setup needed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing authorization header." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Identifies the caller and checks their own role via the existing
  // "users can read own profile" RLS policy -- no special privilege yet.
  const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "Invalid session." }, 401);

  const { data: callerProfile } = await callerClient
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return json({ error: "Only admins can create accounts." }, 403);
  }

  let body: { email?: string; password?: string; display_name?: string; role?: "admin" | "operator" };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const displayName = body.display_name?.trim() || null;
  const role = body.role === "admin" ? "admin" : "operator";

  if (!email) return json({ error: "Email is required." }, 400);
  if (password.length < 6) return json({ error: "Password must be at least 6 characters." }, 400);

  // Privileged from here on -- service-role key bypasses RLS.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    return json({ error: createError?.message ?? "Failed to create user." }, 400);
  }

  const { error: profileError } = await adminClient.from("profiles").insert({
    id: created.user.id,
    role,
    display_name: displayName,
    email,
  });

  if (profileError) {
    return json({ error: `User created, but profile setup failed: ${profileError.message}` }, 500);
  }

  return json({ id: created.user.id, email, role, display_name: displayName });
});
