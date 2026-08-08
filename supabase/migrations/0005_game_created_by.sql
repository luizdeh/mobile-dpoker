-- Track which authenticated user created each game. Defaulting to auth.uid()
-- means the app doesn't need to pass this explicitly, and it's set from the
-- caller's JWT server-side rather than a client-supplied value.
alter table public.games add column created_by uuid references auth.users(id) default auth.uid();
