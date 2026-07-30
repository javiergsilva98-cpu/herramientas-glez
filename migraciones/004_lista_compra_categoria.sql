-- 004_lista_compra_categoria.sql
-- Lista de la compra: categoría de pasillo/sección del súper, para poder
-- ordenar los productos según el recorrido típico de la tienda.
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

alter table public.shopping_items
  add column if not exists category text;

alter table public.shopping_items
  add constraint shopping_items_category_check
    check (
      category is null
      or category in (
        'fruteria',
        'verduleria',
        'panaderia',
        'carniceria',
        'pescaderia',
        'charcuteria',
        'lacteos',
        'congelados',
        'bebidas',
        'conservas',
        'bodega',
        'drogueria',
        'perfumeria',
        'higiene',
        'otros'
      )
    );
