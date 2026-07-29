# Supabase setup

One-time steps for a new Supabase project backing this app.

1. Create a project at supabase.com. Grab the **Project URL** and **anon public key** from Project Settings > API — these go in `.env` (see `.env.example` in the repo root).
2. Open the SQL Editor and run `migrations/0001_init.sql`.
3. Go to Authentication > Users and create yourself an account (email + password).
4. Open the Table Editor, `profiles` table, and insert a row: `id` = your new user's UUID (copy it from the Users list), `role` = `admin`.
5. To grant someone operator access later: create their user under Authentication > Users, then insert a `profiles` row for them with `role` = `operator`. There's no in-app UI for this on purpose — it keeps user creation solely in your hands.
