-- Lets admins manage operator accounts from inside the app instead of only
-- via the Table Editor. Adds an email column (auth.users isn't reachable
-- from the client, so we mirror it here) and lets admins see/write every
-- profiles row, not just their own.

alter table public.profiles add column email text;

create policy "admins can read all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admins can insert profiles" on public.profiles
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admins can update profiles" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admins can delete profiles" on public.profiles
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
