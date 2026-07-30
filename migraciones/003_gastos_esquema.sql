-- 003_gastos_esquema.sql
-- Divisor de gastos: esquema completo (salas, miembros fantasma, gastos,
-- reparto, liquidaciones, comentarios, plantillas recurrentes) + RLS.
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.
--
-- Las tablas se crean todas primero y las políticas RLS al final, porque
-- varias políticas hacen referencia cruzada a otras tablas del esquema
-- (por ejemplo, la de "rooms" comprueba "room_members").

-- =======================================================================
-- TABLAS
-- =======================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text not null default 'EUR',
  room_type text not null default 'general',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint rooms_room_type_check check (
    room_type in ('viaje', 'piso', 'evento', 'general')
  )
);

create table public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  user_id uuid references public.profiles (id),
  phone text not null,
  display_name text not null,
  role text not null default 'member',
  is_ghost boolean not null default true,
  invited_by uuid references public.profiles (id),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint room_members_role_check check (role in ('admin', 'member')),
  constraint room_members_room_phone_unique unique (room_id, phone)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  paid_by uuid not null references public.room_members (id),
  amount numeric(10, 2) not null check (amount > 0),
  description text not null,
  category text not null default 'otros',
  expense_date date not null default current_date,
  receipt_url text,
  split_type text not null default 'equal',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint expenses_split_type_check check (
    split_type in ('equal', 'exact', 'percentage', 'shares')
  )
);

create table public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  member_id uuid not null references public.room_members (id),
  amount numeric(10, 2) not null,
  share_value numeric(10, 2)
);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  from_member_id uuid not null references public.room_members (id),
  to_member_id uuid not null references public.room_members (id),
  amount numeric(10, 2) not null check (amount > 0),
  method text not null default 'bizum',
  note text,
  created_by uuid references public.profiles (id),
  settled_at timestamptz not null default now(),
  constraint settlements_method_check check (
    method in ('bizum', 'efectivo', 'transferencia', 'otro')
  )
);

create table public.expense_comments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  member_id uuid not null references public.room_members (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.recurring_expense_templates (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  paid_by uuid not null references public.room_members (id),
  amount numeric(10, 2) not null check (amount > 0),
  description text not null,
  category text not null default 'otros',
  split_type text not null default 'equal',
  frequency text not null default 'monthly',
  day_of_period int not null,
  next_run_date date not null,
  active boolean not null default true,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint recurring_split_type_check check (
    split_type in ('equal', 'exact', 'percentage', 'shares')
  ),
  constraint recurring_frequency_check check (frequency in ('weekly', 'monthly'))
);

create table public.recurring_expense_splits (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.recurring_expense_templates (id) on delete cascade,
  member_id uuid not null references public.room_members (id),
  share_value numeric(10, 2)
);

-- =======================================================================
-- TRIGGERS
-- =======================================================================

-- Crea automáticamente el perfil cuando alguien se registra en Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: crea el perfil para usuarios que ya existían en Supabase Auth
-- antes de esta migración (el trigger de arriba solo aplica a altas nuevas).
insert into public.profiles (id, display_name)
select
  id,
  coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;

-- Cuando alguien se registra (o rellena su teléfono) y ese teléfono
-- coincide con un miembro fantasma en alguna sala, se vincula
-- automáticamente sin perder el histórico.
create or replace function public.claim_ghost_members()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.phone is not null then
    update public.room_members
    set user_id = new.id,
        is_ghost = false,
        claimed_at = now()
    where phone = new.phone
      and user_id is null;
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_phone_set on public.profiles;
create trigger on_profile_phone_set
  after insert or update of phone on public.profiles
  for each row
  when (new.phone is not null)
  execute function public.claim_ghost_members();

-- =======================================================================
-- ROW LEVEL SECURITY
-- =======================================================================

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;
alter table public.settlements enable row level security;
alter table public.expense_comments enable row level security;
alter table public.recurring_expense_templates enable row level security;
alter table public.recurring_expense_splits enable row level security;

-- ---- profiles ----

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- ---- rooms ----

create policy "rooms_select_if_member"
  on public.rooms for select
  using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = rooms.id
        and room_members.user_id = auth.uid()
    )
  );

create policy "rooms_insert_own"
  on public.rooms for insert
  with check (created_by = auth.uid());

create policy "rooms_update_if_admin"
  on public.rooms for update
  using (
    exists (
      select 1 from public.room_members
      where room_members.room_id = rooms.id
        and room_members.user_id = auth.uid()
        and room_members.role = 'admin'
    )
  );

-- ---- room_members ----

create policy "room_members_select_if_in_room"
  on public.room_members for select
  using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_members.room_id
        and rm.user_id = auth.uid()
    )
  );

-- Insertar miembros: (a) el creador de la sala añadiéndose a sí mismo como
-- admin justo al crearla, o (b) un admin ya existente de la sala añadiendo
-- a otra persona (posiblemente fantasma).
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
    or exists (
      select 1 from public.room_members rm
      where rm.room_id = room_members.room_id
        and rm.user_id = auth.uid()
        and rm.role = 'admin'
    )
  );

create policy "room_members_update_if_admin"
  on public.room_members for update
  using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_members.room_id
        and rm.user_id = auth.uid()
        and rm.role = 'admin'
    )
  );

create policy "room_members_delete_if_admin"
  on public.room_members for delete
  using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = room_members.room_id
        and rm.user_id = auth.uid()
        and rm.role = 'admin'
    )
  );

-- ---- expenses ----

create policy "expenses_select_if_member"
  on public.expenses for select
  using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = expenses.room_id
        and rm.user_id = auth.uid()
    )
  );

create policy "expenses_insert_if_member"
  on public.expenses for insert
  with check (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = expenses.room_id
        and rm.user_id = auth.uid()
    )
  );

create policy "expenses_update_if_owner_or_admin"
  on public.expenses for update
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.room_members rm
      where rm.room_id = expenses.room_id
        and rm.user_id = auth.uid()
        and rm.role = 'admin'
    )
  );

create policy "expenses_delete_if_owner_or_admin"
  on public.expenses for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.room_members rm
      where rm.room_id = expenses.room_id
        and rm.user_id = auth.uid()
        and rm.role = 'admin'
    )
  );

-- ---- expense_splits ----

create policy "expense_splits_select_if_member"
  on public.expense_splits for select
  using (
    exists (
      select 1 from public.expenses e
      join public.room_members rm on rm.room_id = e.room_id
      where e.id = expense_splits.expense_id
        and rm.user_id = auth.uid()
    )
  );

create policy "expense_splits_insert_if_member"
  on public.expense_splits for insert
  with check (
    exists (
      select 1 from public.expenses e
      join public.room_members rm on rm.room_id = e.room_id
      where e.id = expense_splits.expense_id
        and rm.user_id = auth.uid()
    )
  );

create policy "expense_splits_update_if_owner_or_admin"
  on public.expense_splits for update
  using (
    exists (
      select 1 from public.expenses e
      join public.room_members rm on rm.room_id = e.room_id
      where e.id = expense_splits.expense_id
        and rm.user_id = auth.uid()
        and (e.created_by = auth.uid() or rm.role = 'admin')
    )
  );

create policy "expense_splits_delete_if_owner_or_admin"
  on public.expense_splits for delete
  using (
    exists (
      select 1 from public.expenses e
      join public.room_members rm on rm.room_id = e.room_id
      where e.id = expense_splits.expense_id
        and rm.user_id = auth.uid()
        and (e.created_by = auth.uid() or rm.role = 'admin')
    )
  );

-- ---- settlements ----

create policy "settlements_select_if_member"
  on public.settlements for select
  using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = settlements.room_id
        and rm.user_id = auth.uid()
    )
  );

create policy "settlements_insert_if_member"
  on public.settlements for insert
  with check (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = settlements.room_id
        and rm.user_id = auth.uid()
    )
  );

create policy "settlements_delete_if_owner_or_admin"
  on public.settlements for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.room_members rm
      where rm.room_id = settlements.room_id
        and rm.user_id = auth.uid()
        and rm.role = 'admin'
    )
  );

-- ---- expense_comments ----

create policy "expense_comments_select_if_member"
  on public.expense_comments for select
  using (
    exists (
      select 1 from public.expenses e
      join public.room_members rm on rm.room_id = e.room_id
      where e.id = expense_comments.expense_id
        and rm.user_id = auth.uid()
    )
  );

create policy "expense_comments_insert_if_member"
  on public.expense_comments for insert
  with check (
    exists (
      select 1 from public.expenses e
      join public.room_members rm on rm.room_id = e.room_id
      where e.id = expense_comments.expense_id
        and rm.user_id = auth.uid()
    )
  );

create policy "expense_comments_delete_own"
  on public.expense_comments for delete
  using (
    exists (
      select 1 from public.room_members rm
      where rm.id = expense_comments.member_id
        and rm.user_id = auth.uid()
    )
  );

-- ---- recurring_expense_templates ----

create policy "recurring_templates_select_if_member"
  on public.recurring_expense_templates for select
  using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = recurring_expense_templates.room_id
        and rm.user_id = auth.uid()
    )
  );

create policy "recurring_templates_manage_if_admin"
  on public.recurring_expense_templates for all
  using (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = recurring_expense_templates.room_id
        and rm.user_id = auth.uid()
        and rm.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.room_members rm
      where rm.room_id = recurring_expense_templates.room_id
        and rm.user_id = auth.uid()
        and rm.role = 'admin'
    )
  );

-- ---- recurring_expense_splits ----

create policy "recurring_splits_select_if_member"
  on public.recurring_expense_splits for select
  using (
    exists (
      select 1 from public.recurring_expense_templates t
      join public.room_members rm on rm.room_id = t.room_id
      where t.id = recurring_expense_splits.template_id
        and rm.user_id = auth.uid()
    )
  );

create policy "recurring_splits_manage_if_admin"
  on public.recurring_expense_splits for all
  using (
    exists (
      select 1 from public.recurring_expense_templates t
      join public.room_members rm on rm.room_id = t.room_id
      where t.id = recurring_expense_splits.template_id
        and rm.user_id = auth.uid()
        and rm.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.recurring_expense_templates t
      join public.room_members rm on rm.room_id = t.room_id
      where t.id = recurring_expense_splits.template_id
        and rm.user_id = auth.uid()
        and rm.role = 'admin'
    )
  );
