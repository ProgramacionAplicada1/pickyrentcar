-- ============================================================================
-- 015_cleanup_orphan_storage.sql
-- ----------------------------------------------------------------------------
-- Crea la funcion cleanup_orphan_vehicle_images(max_age_hours int) que borra
-- objetos del bucket 'vehicles' que:
--   1. Tienen mas de max_age_hours de antiguedad, Y
--   2. NO estan referenciados en ninguna fila de public.vehicles.image_urls.
--
-- Es idempotente (create or replace). Se ejecuta una vez despues de 014.
--
-- ============================================================================

create or replace function public.cleanup_orphan_vehicle_images(
  max_age_hours int default 24
)
returns int
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  deleted_count int := 0;
  cutoff timestamptz := now() - (max_age_hours || ' hours')::interval;
begin
  with referenced_urls as (
    select distinct url
    from public.vehicles,
         lateral unnest(coalesce(vehicles.image_urls, '{}'::text[])) as url
  ),
  orphans as (
    select o.id
    from storage.objects o
    where o.bucket_id = 'vehicles'
      and o.created_at < cutoff
      and not exists (
        select 1
        from referenced_urls r
        where r.url = ('https://' || (select name from storage.buckets where id = o.bucket_id)
                       || '.supabase.co/storage/v1/object/public/'
                       || o.bucket_id || '/' || o.name)
      )
  )
  delete from storage.objects
  where id in (select id from orphans);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

comment on function public.cleanup_orphan_vehicle_images(int) is
  'Borra objetos del bucket vehicles sin referencias en vehicles.image_urls '
  'y mas antiguos que max_age_hours. Devuelve el numero de filas borradas. '
  'Pensado para limpieza periodica de imagenes huerfanas tras cancelacion '
  'de formularios.';

revoke all on function public.cleanup_orphan_vehicle_images(int) from public;

grant execute on function public.cleanup_orphan_vehicle_images(int) to service_role;