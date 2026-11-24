-- ============================================================================
-- PickyRentCar — 020_default_role_cliente.sql
-- ============================================================================
-- Modelo multi-tenant: cualquiera puede registrarse como admin (dueño de
-- flota) desde /register, pero el rol por defecto debe ser `cliente`.
--
-- Antes (migración 003): solo era cliente quien enviaba role = 'cliente';
-- todo lo demás —incluido cualquier registro con Google, que no envía
-- metadata de rol— terminaba como admin.
--
-- Ahora:
--   - role = 'admin' solo si el registro lo pide explícitamente
--     (raw_user_meta_data.role = 'admin', lo envía components/register-form.tsx).
--   - Cualquier otro caso (sin rol, Google, valores desconocidos) → 'cliente'.
--   - profiles.role default 'cliente' + CHECK de valores válidos.
--
-- No modifica perfiles existentes (ver consulta al final para revisarlos).
-- Idempotente.
-- ============================================================================

begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    case
      when new.raw_user_meta_data->>'role' = 'admin' then 'admin'
      else 'cliente'
    end
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

alter table public.profiles alter column role set default 'cliente';

do $$
begin
  if not exists (select 1 from pg_constraint
                 where conname = 'profiles_role_check'
                   and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('admin', 'cliente')) not valid;
  end if;
end $$;

do $$
begin
  alter table public.profiles validate constraint profiles_role_check;
exception when check_violation then
  raise notice 'profiles: hay filas con un role distinto de admin/cliente; revisarlas y ejecutar VALIDATE CONSTRAINT';
end $$;

commit;

-- ----------------------------------------------------------------------------
-- Revisión manual (NO se ejecuta): cuentas que quedaron como admin por
-- haberse registrado con Google o sin rol explícito. Un admin real tendrá
-- normalmente vehículos registrados.
--
--   select p.id, u.email, u.raw_app_meta_data->>'provider' as provider,
--          p.created_at,
--          (select count(*) from public.vehicles v where v.created_by = p.id) as vehiculos
--   from public.profiles p
--   join auth.users u on u.id = p.id
--   where p.role = 'admin'
--   order by vehiculos, p.created_at desc;
--
-- Para corregir una cuenta concreta:
--   update public.profiles set role = 'cliente' where id = '<uuid>';
-- ----------------------------------------------------------------------------

-- ============================================================================
-- Fin de 020_default_role_cliente.sql
-- ============================================================================
