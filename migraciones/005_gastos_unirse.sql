-- 005_gastos_unirse.sql
-- Divisor de gastos: permite que cualquier usuario autenticado que tenga
-- el enlace de una sala pueda unirse a ella él mismo (como miembro normal,
-- no admin). Si ya existía como miembro fantasma en esa sala (añadido por
-- número de teléfono), se reclama esa fila en vez de duplicarla.
--
-- Se implementa como función security definer en vez de relajar las
-- políticas RLS de "room_members", para no abrir la tabla entera: la
-- función solo puede insertar/actualizar una fila para el propio usuario
-- que la llama (auth.uid()), nunca en nombre de otro.
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

create or replace function public.join_room(p_room_id uuid)
returns table (room_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_phone text;
  v_display_name text;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select phone, display_name into v_phone, v_display_name
  from profiles where id = v_user_id;

  if v_phone is null then
    raise exception 'phone_required';
  end if;

  if not exists (select 1 from rooms where id = p_room_id) then
    raise exception 'room_not_found';
  end if;

  -- Reclama un miembro fantasma existente con el mismo teléfono en esta sala.
  update room_members
  set user_id = v_user_id,
      is_ghost = false,
      claimed_at = now()
  where room_id = p_room_id
    and phone = v_phone
    and user_id is null;

  if not found then
    insert into room_members (room_id, user_id, phone, display_name, role, is_ghost, claimed_at)
    values (p_room_id, v_user_id, v_phone, coalesce(v_display_name, 'Sin nombre'), 'member', false, now())
    on conflict (room_id, phone) do nothing;
  end if;

  return query select rooms.name from rooms where rooms.id = p_room_id;
end;
$$;

grant execute on function public.join_room(uuid) to authenticated;
