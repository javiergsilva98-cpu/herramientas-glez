-- 010_jara.sql
-- Jara: salud y día a día del perro.
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

create table if not exists public.jara_health_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in ('vacuna', 'desparasitacion', 'visita_veterinario', 'incidencia')
  ),
  event_date date not null default current_date,
  next_due_date date,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.hunting_days (
  id uuid primary key default gen_random_uuid(),
  event_date date not null default current_date,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.grooming_reminders (
  id uuid primary key default gen_random_uuid(),
  event_date date not null default current_date,
  next_due_date date,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.jara_health_events enable row level security;
alter table public.hunting_days enable row level security;
alter table public.grooming_reminders enable row level security;

-- Igual que en lista de la compra: herramienta personal/familiar,
-- cualquier usuario autenticado puede leer y editar. No hay aislamiento
-- por usuario.

create policy "jara_health_events_select_authenticated"
  on public.jara_health_events for select
  to authenticated
  using (true);

create policy "jara_health_events_insert_authenticated"
  on public.jara_health_events for insert
  to authenticated
  with check (true);

create policy "jara_health_events_update_authenticated"
  on public.jara_health_events for update
  to authenticated
  using (true);

create policy "jara_health_events_delete_authenticated"
  on public.jara_health_events for delete
  to authenticated
  using (true);

create policy "hunting_days_select_authenticated"
  on public.hunting_days for select
  to authenticated
  using (true);

create policy "hunting_days_insert_authenticated"
  on public.hunting_days for insert
  to authenticated
  with check (true);

create policy "hunting_days_update_authenticated"
  on public.hunting_days for update
  to authenticated
  using (true);

create policy "hunting_days_delete_authenticated"
  on public.hunting_days for delete
  to authenticated
  using (true);

create policy "grooming_reminders_select_authenticated"
  on public.grooming_reminders for select
  to authenticated
  using (true);

create policy "grooming_reminders_insert_authenticated"
  on public.grooming_reminders for insert
  to authenticated
  with check (true);

create policy "grooming_reminders_update_authenticated"
  on public.grooming_reminders for update
  to authenticated
  using (true);

create policy "grooming_reminders_delete_authenticated"
  on public.grooming_reminders for delete
  to authenticated
  using (true);
