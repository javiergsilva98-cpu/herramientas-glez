-- 011_garaje_documentos_archivo.sql
-- Añade soporte de archivo adjunto (PDF o imagen) a los documentos de
-- vehículos: columnas en la tabla y bucket de Storage con políticas.
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

alter table public.vehicle_documents
  add column if not exists file_url text,
  add column if not exists file_name text;

insert into storage.buckets (id, name, public)
select 'vehicle-documents', 'vehicle-documents', true
where not exists (
  select 1 from storage.buckets where id = 'vehicle-documents'
);

-- Igual que el resto de la app: herramienta personal/familiar, cualquier
-- usuario autenticado puede leer y editar los archivos de este bucket.

create policy "vehicle_documents_bucket_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'vehicle-documents');

create policy "vehicle_documents_bucket_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'vehicle-documents');

create policy "vehicle_documents_bucket_update_authenticated"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'vehicle-documents');

create policy "vehicle_documents_bucket_delete_authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'vehicle-documents');
