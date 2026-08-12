# Supabase setup

One-time steps for a new Supabase project backing this app.

1. Create a project at supabase.com. Grab the **Project URL** and **anon public key** from Project Settings > API — these go in `.env` (see `.env.example` in the repo root).
2. Open the SQL Editor and run each file under `migrations/`, in order (`0001_init.sql`, `0002_...`, etc).
3. Go to Authentication > Users and create yourself an account (email + password).
4. Open the Table Editor, `profiles` table, and insert a row: `id` = your new user's UUID (copy it from the Users list), `role` = `admin`, `email` = your email.
5. Deploy the `create-operator` Edge Function (see below). Once that's done, sign in to the app as your admin account and use SETTINGS > MANAGE OPERATORS to create operator (or additional admin) accounts with a password you set — no more manual Dashboard steps for that, and no invite email is sent.
6. From that same screen you can also change anyone's role or revoke access (deletes the `profiles` row, not their login).

Any signed-in user can change their own password from SETTINGS in the app — no dashboard step needed for that.

## Deploying the `create-operator` Edge Function

This function creates new logins with a password, which requires the service-role key — it must run server-side, never in the app. Supabase injects `SUPABASE_URL`/`SUPABASE_ANON_KEY`/`SUPABASE_SERVICE_ROLE_KEY` into every Edge Function automatically, so no secrets need to be configured manually.

Easiest path (no CLI install needed, same spirit as running migrations by hand):
1. In the Supabase Dashboard, go to Edge Functions > Create a new function, name it `create-operator`.
2. Paste the contents of `supabase/functions/create-operator/index.ts` into the editor and deploy.

If you have the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to this project instead, `supabase functions deploy create-operator` does the same thing.
