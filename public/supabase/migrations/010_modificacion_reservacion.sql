-- ============================================================================
-- 010_modificacion_reservacion.sql
-- Agrega el client_id a las reservaciones y lo relaciona con profiles.
-- Si el usuario está autenticado, se guarda su id en client_id.
-- Si realiza la reserva como invitado, client_id permanecerá en NULL.
-- ============================================================================

alter table public.reservations
add column if not exists client_id uuid;

alter table public.reservations
drop constraint if exists reservations_client_id_fkey;

alter table public.reservations
add constraint reservations_client_id_fkey
foreign key (client_id)
references public.profiles(id)
on delete set null;

create index if not exists reservations_client_id_idx
on public.reservations(client_id);