# Estado de las migraciones

Cada script se ejecuta a mano en el **SQL Editor** de Supabase, en orden.
Cuando ejecutes uno y te salga success, dímelo (ej. "el 001 success") y
actualizo esta tabla. Si en algún momento no te acuerdas por cuál vas,
pregúntame y te digo cuál es el último marcado como ejecutado.

| # | Archivo | Descripción | Estado |
|---|---|---|---|
| 001 | [`001_lista_compra.sql`](./001_lista_compra.sql) | Tabla `shopping_items` (Lista de la compra) + políticas RLS | ✅ Ejecutado |
| 002 | [`002_lista_compra_detalles.sql`](./002_lista_compra_detalles.sql) | Añade tienda, cantidad con unidad y urgencia a `shopping_items` | ✅ Ejecutado |
| 003 | [`003_gastos_esquema.sql`](./003_gastos_esquema.sql) | Divisor de gastos: perfiles, salas, miembros fantasma, gastos, reparto, liquidaciones, comentarios, plantillas recurrentes + RLS | ✅ Ejecutado |
| 004 | [`004_lista_compra_categoria.sql`](./004_lista_compra_categoria.sql) | Añade categoría de pasillo/sección (frutería, droguería...) a `shopping_items` | ✅ Ejecutado |
| 005 | [`005_gastos_unirse.sql`](./005_gastos_unirse.sql) | Función `join_room` para unirte a una sala de gastos por enlace | ✅ Ejecutado |
| 006 | [`006_gastos_admin_y_arreglo.sql`](./006_gastos_admin_y_arreglo.sql) | Arregla el bug de RLS que dejaba salas sin miembros, repara las huérfanas, y restringe crear salas a administradores de la app | ✅ Ejecutado |
| 007 | [`007_gastos_fix_recursion.sql`](./007_gastos_fix_recursion.sql) | Arregla "infinite recursion detected in policy for relation room_members" reescribiendo las políticas con funciones security definer | ✅ Ejecutado |
| 008 | [`008_gastos_invitar_miembro.sql`](./008_gastos_invitar_miembro.sql) | Función `claim_member` para vincular un enlace de invitación a un miembro fantasma concreto | ✅ Ejecutado |
| 009 | [`009_garaje.sql`](./009_garaje.sql) | Garaje: tablas `vehicles`, `maintenance_records`, `vehicle_documents` + RLS + alta de moto y coche | ⏳ Pendiente |
| 010 | [`010_jara.sql`](./010_jara.sql) | Jara: tablas `jara_health_events`, `hunting_days`, `grooming_reminders` + RLS | ⏳ Pendiente |
