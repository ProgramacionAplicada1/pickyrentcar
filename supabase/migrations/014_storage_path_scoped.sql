-- ============================================================================
-- 014_storage_path_scoped.sql
-- ----------------------------------------------------------------------------
-- Reemplaza las 4 policies originales de storage.objects del bucket 'vehicles'
-- por versions con scope de path. Cada usuario autenticado solo puede
-- subir/actualizar/borrar objetos cuyo primer segmento del path coincide con
-- su auth.uid() (convencion {user_id}/slot{N}-{ts}-{rand}.{ext}).
-- Es idempotente (drop if exists + create). Se ejecuta una vez despues de 013.
-- ============================================================================

drop policy if exists "Public read of vehicle images"               on storage.objects;
drop policy if exists "Authenticated can upload vehicle images"     on storage.objects;
drop policy if exists "Authenticated can update vehicle images"     on storage.objects;
drop policy if exists "Authenticated can delete vehicle images"     on storage.objects;

drop policy if exists "Users upload to own folder"                  on storage.objects;
drop policy if exists "Users update own files"                      on storage.objects;
drop policy if exists "Users delete own files"                      on storage.objects;

-- SELECT sigue publico: el bucket es publico por diseno.
create policy "Public read of vehicle images"
  on storage.objects for select
  using (bucket_id = 'vehicles');

-- (storage.foldername(name))[1] extrae el primer segmento del path.
-- Para nuestro formato '{user_id}/slot{N}-{ts}-{rand}.{ext}' devuelve
-- el user_id. Comparamos contra auth.uid()::text.
create policy "Users upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'vehicles'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own files"
  on storage.objects for update
  using (
    bucket_id = 'vehicles'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'vehicles'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'vehicles'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Auditoria rapida post-aplicacion:
--   select polname, pg_get_expr(polqual, polrelid)
--   from pg_policy where polrelid = 'storage.objects'::regclass;
-- Nombres legitimos esperados en bucket 'vehicles':
--   - Public read of vehicle images
--   - Users upload to own folder
--   - Users update own files
--   - Users delete own files