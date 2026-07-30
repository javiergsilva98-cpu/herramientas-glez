-- 006_gastos_admin_y_arreglo.sql
-- 1) Arregla un bug de RLS: al crear una sala, la política que te añadía
--    como admin necesitaba poder "ver" esa sala para comprobar que tú
--    eras quien la había creado, pero la política de lectura de salas
--    exigía ya ser miembro. Bucle imposible -> el insert de tu propia
--    membresía fallaba en silencio y la sala se quedaba sin nadie dentro
--    (invisible incluso para quien la creó).
-- 2) Repara las salas que se quedaron huérfanas por este bug, añadiendo
--    a su creador como admin.
-- 3) Restringe la creación de salas nuevas a los administradores de la
--    app (marcados con profiles.can_create_rooms); el resto de gente
--    solo puede unirse a través de un enlace de invitación.
-- 4) Permite borrar una sala a sus admins.
--
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

-- 1) Arreglo del bug: el creador de una sala siempre puede verla.
create policy "rooms_select_if_creator"
  on public.rooms for select
  using (created_by = auth.uid());

-- 2) Repara salas huérfanas (sin ningún miembro) añadiendo a su creador
--    como admin, usando el teléfono/nombre de su perfil.
insert into public.room_members (room_id, user_id, phone, display_name, role, is_ghost, claimed_at)
select r.id, r.created_by, p.phone, p.display_name, 'admin', false, now()
from public.rooms r
join public.profiles p on p.id = r.created_by
where p.phone is not null
  and not exists (
    select 1 from public.room_members rm
    where rm.room_id = r.id and rm.user_id = r.created_by
  )
on conflict (room_id, phone) do nothing;

-- 3) Solo los administradores de la app pueden crear salas nuevas.
alter table public.profiles
  add column if not exists can_create_rooms boolean not null default false;

drop policy if exists "rooms_insert_own" on public.rooms;
create policy "rooms_insert_own"
  on public.rooms for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.can_create_rooms
    )
  );

-- 4) Los admins de una sala pueden borrarla (arrastra gastos, miembros,
--    liquidaciones, etc. por los "on delete cascade" del esquema).
create policy "rooms_delete_if_admin"
  on public.rooms for delete
  using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = rooms.id
        and room_members.user_id = auth.uid()
        and room_members.role = 'admin'
    )
  );

-- Marca tu propio usuario como administrador de la app (puede crear
-- salas). Si más adelante quieres dar este permiso a alguien más,
-- repite este update con su email.
update public.profiles
set can_create_rooms = true
where id = (select id from auth.users where email = 'javiergsilva98@gmail.com');
