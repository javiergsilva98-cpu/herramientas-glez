-- 012_jara_precio_lugar.sql
-- Añade precio y lugar a los eventos de salud de Jara (por ejemplo, para
-- una visita al veterinario de urgencias fuera del habitual).
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

alter table public.jara_health_events
  add column if not exists price numeric(10, 2),
  add column if not exists place text;
