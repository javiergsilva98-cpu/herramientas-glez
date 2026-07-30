-- 009_garaje.sql
-- Garaje: mantenimiento y documentación de vehículos (moto, coche).
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vehicle_type text not null check (vehicle_type in ('moto', 'coche')),
  brand text,
  model text,
  year int,
  plate text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  record_date date not null default current_date,
  km int,
  maintenance_type text not null,
  performed_by text not null check (performed_by in ('taller', 'yo_mismo')),
  workshop_name text,
  price numeric(10, 2),
  interval_km int,
  next_due_date date,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicle_documents (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  document_type text not null check (document_type in ('seguro', 'itv', 'permiso_circulacion', 'otro')),
  expiry_date date,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.vehicle_documents enable row level security;

-- Igual que en lista de la compra: herramienta personal/familiar,
-- cualquier usuario autenticado puede leer y editar. No hay aislamiento
-- por usuario.

create policy "vehicles_select_authenticated"
  on public.vehicles for select
  to authenticated
  using (true);

create policy "vehicles_insert_authenticated"
  on public.vehicles for insert
  to authenticated
  with check (true);

create policy "vehicles_update_authenticated"
  on public.vehicles for update
  to authenticated
  using (true);

create policy "vehicles_delete_authenticated"
  on public.vehicles for delete
  to authenticated
  using (true);

create policy "maintenance_records_select_authenticated"
  on public.maintenance_records for select
  to authenticated
  using (true);

create policy "maintenance_records_insert_authenticated"
  on public.maintenance_records for insert
  to authenticated
  with check (true);

create policy "maintenance_records_update_authenticated"
  on public.maintenance_records for update
  to authenticated
  using (true);

create policy "maintenance_records_delete_authenticated"
  on public.maintenance_records for delete
  to authenticated
  using (true);

create policy "vehicle_documents_select_authenticated"
  on public.vehicle_documents for select
  to authenticated
  using (true);

create policy "vehicle_documents_insert_authenticated"
  on public.vehicle_documents for insert
  to authenticated
  with check (true);

create policy "vehicle_documents_update_authenticated"
  on public.vehicle_documents for update
  to authenticated
  using (true);

create policy "vehicle_documents_delete_authenticated"
  on public.vehicle_documents for delete
  to authenticated
  using (true);

-- Vehículos de partida.
insert into public.vehicles (name, vehicle_type, brand, model)
select 'Moto', 'moto', 'Honda', 'CB500X'
where not exists (select 1 from public.vehicles where name = 'Moto');

insert into public.vehicles (name, vehicle_type, brand, model)
select 'Coche', 'coche', 'Škoda', 'Yeti'
where not exists (select 1 from public.vehicles where name = 'Coche');
