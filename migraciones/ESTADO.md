# Estado de las migraciones

Cada script se ejecuta a mano en el **SQL Editor** de Supabase, en orden.
Cuando ejecutes uno y te salga success, dímelo (ej. "el 001 success") y
actualizo esta tabla. Si en algún momento no te acuerdas por cuál vas,
pregúntame y te digo cuál es el último marcado como ejecutado.

| # | Archivo | Descripción | Estado |
|---|---|---|---|
| 001 | [`001_lista_compra.sql`](./001_lista_compra.sql) | Tabla `shopping_items` (Lista de la compra) + políticas RLS | ⏳ Pendiente |
