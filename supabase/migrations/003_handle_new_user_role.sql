-- ============================================================================
-- PickyRentCar — 003_handle_new_user_role.sql
-- ============================================================================
-- Actualiza handle_new_user() para que lea el role desde raw_user_meta_data.
-- Whitelist: solo acepta 'cliente' explícitamente; cualquier otro caso cae al
-- default 'admin'. Esto evita que alguien pase role='superadmin' (o similar)
-- en metadata y se vuelva admin.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case
      when new.raw_user_meta_data->>'role' = 'cliente' then 'cliente'
      else 'admin'
    end
  );
  return new;
end;
$$;

-- ============================================================================
-- Fin de 003_handle_new_user_role.sql
-- ============================================================================