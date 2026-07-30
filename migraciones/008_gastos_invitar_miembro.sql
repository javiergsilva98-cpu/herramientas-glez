-- 008_gastos_invitar_miembro.sql
-- Divisor de gastos: permite generar un enlace de invitación para UN
-- miembro fantasma concreto, que lo vincula directamente a esa fila sin
-- depender de que el teléfono con el que se registre coincida.
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

create or replace function public.claim_member(p_member_id uuid)
returns table (room_id uuid, room_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_room_id uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select room_members.room_id into v_room_id
  from room_members
  where room_members.id = p_member_id
    and room_members.user_id is null;

  if v_room_id is null then
    raise exception 'member_not_found_or_already_claimed';
  end if;

  update room_members
  set user_id = v_user_id,
      is_ghost = false,
      claimed_at = now()
  where id = p_member_id;

  return query select rooms.id, rooms.name from rooms where rooms.id = v_room_id;
end;
$$;

grant execute on function public.claim_member(uuid) to authenticated;
