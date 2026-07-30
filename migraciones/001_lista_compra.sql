-- 001_lista_compra.sql
-- Lista de la compra: tabla shopping_items + políticas RLS
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity text,
  is_checked boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  checked_at timestamptz
);

alter table public.shopping_items enable row level security;

-- Herramientas de uso personal/familiar: cualquier usuario autenticado
-- (los que hayas invitado desde el dashboard de Supabase) puede leer y
-- editar la lista compartida. No hay aislamiento por usuario todavía.

create policy "shopping_items_select_authenticated"
  on public.shopping_items for select
  to authenticated
  using (true);

create policy "shopping_items_insert_authenticated"
  on public.shopping_items for insert
  to authenticated
  with check (true);

create policy "shopping_items_update_authenticated"
  on public.shopping_items for update
  to authenticated
  using (true);

create policy "shopping_items_delete_authenticated"
  on public.shopping_items for delete
  to authenticated
  using (true);
