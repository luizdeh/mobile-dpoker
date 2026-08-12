-- 0007's admin policies on `profiles` queried `profiles` from within their
-- own USING clause, which re-triggers RLS on the same table and causes
-- Postgres to error with "infinite recursion detected in policy for
-- relation \"profiles\"" -- silently breaking role lookups for everyone,
-- including existing admins. Fix: check admin status through a
-- SECURITY DEFINER function, which runs with the privileges of its owner
-- and so bypasses RLS internally instead of re-entering it.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

drop policy "admins can read all profiles" on public.profiles;
drop policy "admins can insert profiles" on public.profiles;
drop policy "admins can update profiles" on public.profiles;
drop policy "admins can delete profiles" on public.profiles;

create policy "admins can read all profiles" on public.profiles
  for select using (public.is_admin());

create policy "admins can insert profiles" on public.profiles
  for insert with check (public.is_admin());

create policy "admins can update profiles" on public.profiles
  for update using (public.is_admin());

create policy "admins can delete profiles" on public.profiles
  for delete using (public.is_admin());
