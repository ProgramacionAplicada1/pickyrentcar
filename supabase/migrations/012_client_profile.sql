-- ============================================================================
-- PickyRentCar — 012_client_profile.sql
-- ============================================================================
-- Amplía el perfil de usuario y endurece las actualizaciones desde el cliente.
-- Los usuarios autenticados pueden editar sus propios datos personales, pero
-- NO pueden modificar columnas sensibles como role o id.
-- ============================================================================

alter table public.profiles
  add column if not exists phone text,
  add column if not exists avatar_url text,
  add column if not exists updated_at timestamptz not null default now();

-- Mantiene updated_at sincronizado sin depender del cliente.
create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profile_updated_at();

-- La fila solo puede ser actualizada por su propietario.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- IMPORTANTE: quitamos UPDATE general y concedemos únicamente las columnas
-- que un usuario puede editar desde su perfil. De esta forma no puede cambiar
-- role='cliente' a role='admin' desde PostgREST/Supabase JS.
revoke update on table public.profiles from authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;
