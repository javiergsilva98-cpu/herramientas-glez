-- 007_gastos_fix_recursion.sql
-- Divisor de gastos: arregla "infinite recursion detected in policy for
-- relation room_members".
--
-- Causa: varias políticas comprobaban "¿pertenece este usuario a la sala?"
-- con una subconsulta sobre la propia tabla room_members. Postgres, al
-- evaluar esa subconsulta, vuelve a aplicar las políticas RLS de
-- room_members, que a su vez repiten la misma subconsulta -> bucle
-- infinito, detectado y bloqueado por Postgres. Esto afectaba a
-- prácticamente todo (crear salas, verlas, unirse, gastos, balances...),
-- no solo a la creación.
--
-- Arreglo: dos funciones "security definer" (is_room_member/is_room_admin)
-- que consultan room_members sin pasar por sus propias políticas RLS,
-- rompiendo el bucle. Se reescriben todas las políticas que antes hacían
-- la subconsulta directa para que usen estas funciones.
--
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

create or replace function public.is_room_member(p_room_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from room_members
    where room_members.room_id = p_room_id
      and room_members.user_id = auth.uid()
  );
$$;

create or replace function public.is_room_admin(p_room_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from room_members
    where room_members.room_id = p_room_id
      and room_members.user_id = auth.uid()
      and room_members.role = 'admin'
  );
$$;

grant execute on function public.is_room_member(uuid) to authenticated;
grant execute on function public.is_room_admin(uuid) to authenticated;

-- ---- rooms ----

drop policy if exists "rooms_select_if_member" on public.rooms;
create policy "rooms_select_if_member"
  on public.rooms for select
  using (public.is_room_member(rooms.id));

drop policy if exists "rooms_update_if_admin" on public.rooms;
create policy "rooms_update_if_admin"
  on public.rooms for update
  using (public.is_room_admin(rooms.id));

drop policy if exists "rooms_delete_if_admin" on public.rooms;
create policy "rooms_delete_if_admin"
  on public.rooms for delete
  using (public.is_room_admin(rooms.id));

-- ---- room_members ----

drop policy if exists "room_members_select_if_in_room" on public.room_members;
create policy "room_members_select_if_in_room"
  on public.room_members for select
  using (public.is_room_member(room_members.room_id));

drop policy if exists "room_members_insert" on public.room_members;
create policy "room_members_insert"
  on public.room_members for insert
  with check (
    (
      user_id = auth.uid()
      and role = 'admin'
      and exists (
        select 1 from public.rooms
        where rooms.id = room_members.room_id
          and rooms.created_by = auth.uid()
      )
    )
    or public.is_room_admin(room_members.room_id)
  );

drop policy if exists "room_members_update_if_admin" on public.room_members;
create policy "room_members_update_if_admin"
  on public.room_members for update
  using (public.is_room_admin(room_members.room_id));

drop policy if exists "room_members_delete_if_admin" on public.room_members;
create policy "room_members_delete_if_admin"
  on public.room_members for delete
  using (public.is_room_admin(room_members.room_id));

-- ---- expenses ----

drop policy if exists "expenses_select_if_member" on public.expenses;
create policy "expenses_select_if_member"
  on public.expenses for select
  using (public.is_room_member(expenses.room_id));

drop policy if exists "expenses_insert_if_member" on public.expenses;
create policy "expenses_insert_if_member"
  on public.expenses for insert
  with check (public.is_room_member(expenses.room_id));

drop policy if exists "expenses_update_if_owner_or_admin" on public.expenses;
create policy "expenses_update_if_owner_or_admin"
  on public.expenses for update
  using (created_by = auth.uid() or public.is_room_admin(expenses.room_id));

drop policy if exists "expenses_delete_if_owner_or_admin" on public.expenses;
create policy "expenses_delete_if_owner_or_admin"
  on public.expenses for delete
  using (created_by = auth.uid() or public.is_room_admin(expenses.room_id));

-- ---- expense_splits ----

drop policy if exists "expense_splits_select_if_member" on public.expense_splits;
create policy "expense_splits_select_if_member"
  on public.expense_splits for select
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_splits.expense_id
        and public.is_room_member(e.room_id)
    )
  );

drop policy if exists "expense_splits_insert_if_member" on public.expense_splits;
create policy "expense_splits_insert_if_member"
  on public.expense_splits for insert
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_splits.expense_id
        and public.is_room_member(e.room_id)
    )
  );

drop policy if exists "expense_splits_update_if_owner_or_admin" on public.expense_splits;
create policy "expense_splits_update_if_owner_or_admin"
  on public.expense_splits for update
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_splits.expense_id
        and (e.created_by = auth.uid() or public.is_room_admin(e.room_id))
    )
  );

drop policy if exists "expense_splits_delete_if_owner_or_admin" on public.expense_splits;
create policy "expense_splits_delete_if_owner_or_admin"
  on public.expense_splits for delete
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_splits.expense_id
        and (e.created_by = auth.uid() or public.is_room_admin(e.room_id))
    )
  );

-- ---- settlements ----

drop policy if exists "settlements_select_if_member" on public.settlements;
create policy "settlements_select_if_member"
  on public.settlements for select
  using (public.is_room_member(settlements.room_id));

drop policy if exists "settlements_insert_if_member" on public.settlements;
create policy "settlements_insert_if_member"
  on public.settlements for insert
  with check (public.is_room_member(settlements.room_id));

drop policy if exists "settlements_delete_if_owner_or_admin" on public.settlements;
create policy "settlements_delete_if_owner_or_admin"
  on public.settlements for delete
  using (created_by = auth.uid() or public.is_room_admin(settlements.room_id));

-- ---- expense_comments ----

drop policy if exists "expense_comments_select_if_member" on public.expense_comments;
create policy "expense_comments_select_if_member"
  on public.expense_comments for select
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_comments.expense_id
        and public.is_room_member(e.room_id)
    )
  );

drop policy if exists "expense_comments_insert_if_member" on public.expense_comments;
create policy "expense_comments_insert_if_member"
  on public.expense_comments for insert
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_comments.expense_id
        and public.is_room_member(e.room_id)
    )
  );

-- expense_comments_delete_own no cambia de forma (ya consulta room_members
-- por id directo), pero ahora es segura porque la política de select de
-- room_members ya no se llama a sí misma.

-- ---- recurring_expense_templates ----

drop policy if exists "recurring_templates_select_if_member" on public.recurring_expense_templates;
create policy "recurring_templates_select_if_member"
  on public.recurring_expense_templates for select
  using (public.is_room_member(recurring_expense_templates.room_id));

drop policy if exists "recurring_templates_manage_if_admin" on public.recurring_expense_templates;
create policy "recurring_templates_manage_if_admin"
  on public.recurring_expense_templates for all
  using (public.is_room_admin(recurring_expense_templates.room_id))
  with check (public.is_room_admin(recurring_expense_templates.room_id));

-- ---- recurring_expense_splits ----

drop policy if exists "recurring_splits_select_if_member" on public.recurring_expense_splits;
create policy "recurring_splits_select_if_member"
  on public.recurring_expense_splits for select
  using (
    exists (
      select 1 from public.recurring_expense_templates t
      where t.id = recurring_expense_splits.template_id
        and public.is_room_member(t.room_id)
    )
  );

drop policy if exists "recurring_splits_manage_if_admin" on public.recurring_expense_splits;
create policy "recurring_splits_manage_if_admin"
  on public.recurring_expense_splits for all
  using (
    exists (
      select 1 from public.recurring_expense_templates t
      where t.id = recurring_expense_splits.template_id
        and public.is_room_admin(t.room_id)
    )
  )
  with check (
    exists (
      select 1 from public.recurring_expense_templates t
      where t.id = recurring_expense_splits.template_id
        and public.is_room_admin(t.room_id)
    )
  );
