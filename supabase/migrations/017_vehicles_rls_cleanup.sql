-- ============================================================================
-- 017_vehicles_rls_cleanup.sql
-- ----------------------------------------------------------------------------
-- Limpia dos problemas en las RLS policies de public.vehicles:
--
--   1. BACKDOOR CRÍTICO: la policy huérfana
--      "Authenticated users can read vehicles" con `to authenticated` y
--      `using (true)` permite a CUALQUIER usuario autenticado leer TODOS
--      los vehículos de TODOS los admins. Esta policy debería haber sido
--      eliminada por la migración `006_drop_huérfana_authenticated_read_vehicles.sql`
--      pero sigue activa (probablemente creada manualmente desde el panel
--      de Supabase después de aplicar 006, o nunca aplicada 006).
--
--   2. COSMÉTICO: las 4 policies `Owners can *` usan `to public` (todos
--      los roles) en lugar de `to authenticated`. El USING/WITH CHECK
--      sigue filtrando correctamente por `auth.uid() = created_by` (para
--      `anon`, `auth.uid()` es null → siempre false → policy rechaza),
--      pero el scope implícito es confuso y se acumula con la policy
--      pública de catálogo.
--
-- Solución:
--   - Drop la huérfana crítica (cierra el backdoor de multi-tenant).
--   - Reemplazar las 4 policies con scope explícito `to authenticated`.
--
-- Resultado: 5 policies limpias, todas con scope explícito:
--   - 4 con `to authenticated` y filtro `auth.uid() = created_by`
--   - 1 con `to anon` y `using (true)` (catálogo público, ya existía)
--
-- Es idempotente (drop if exists + create). Aplicar una vez después de
-- 016_pagos_rls_fix.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------

drop policy if exists "Authenticated users can read vehicles" on public.vehicles;

-- ----------------------------------------------------------------------------
-- Parte 2: Limpiar las 4 policies con scope explícito a authenticated
-- ----------------------------------------------------------------------------

drop policy if exists "Owners can view vehicles"   on public.vehicles;
drop policy if exists "Owners can insert vehicles" on public.vehicles;
drop policy if exists "Owners can update vehicles" on public.vehicles;
drop policy if exists "Owners can delete vehicles" on public.vehicles;

create policy "Owners can view vehicles"
  on public.vehicles for select
  to authenticated
  using (auth.uid() = created_by);

create policy "Owners can insert vehicles"
  on public.vehicles for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Owners can update vehicles"
  on public.vehicles for update
  to authenticated
  using (auth.uid() = created_by);

create policy "Owners can delete vehicles"
  on public.vehicles for delete
  to authenticated
  using (auth.uid() = created_by);

-- ----------------------------------------------------------------------------