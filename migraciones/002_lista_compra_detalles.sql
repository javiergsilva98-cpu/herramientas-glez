-- 002_lista_compra_detalles.sql
-- Lista de la compra: tienda, cantidad con unidad, y urgencia.
-- Ejecuta este script en el SQL editor de tu proyecto Supabase.

alter table public.shopping_items
  alter column quantity type numeric
    using (
      case
        when quantity ~ '^[0-9]+(\.[0-9]+)?$' then quantity::numeric
        else null
      end
    ),
  alter column quantity set default 1;

update public.shopping_items set quantity = 1 where quantity is null;
alter table public.shopping_items alter column quantity set not null;

alter table public.shopping_items
  add column if not exists quantity_unit text not null default 'unidades',
  add column if not exists store_type text,
  add column if not exists store_chain text,
  add column if not exists is_urgent boolean not null default false;

alter table public.shopping_items
  add constraint shopping_items_quantity_unit_check
    check (quantity_unit in ('unidades', 'kg', 'g'));

alter table public.shopping_items
  add constraint shopping_items_store_type_check
    check (
      store_type is null
      or store_type in (
        'supermercado',
        'vivero',
        'leroy_merlin',
        'ikea',
        'decathlon',
        'carniceria_canencia'
      )
    );

alter table public.shopping_items
  add constraint shopping_items_store_chain_check
    check (
      store_chain is null
      or store_chain in ('mercadona', 'carrefour', 'lidl', 'ahorramas')
    );

-- store_chain (Mercadona, Carrefour...) solo tiene sentido si store_type
-- es 'supermercado'; para el resto de tiendas se deja a null.
alter table public.shopping_items
  add constraint shopping_items_store_chain_requires_supermercado
    check (store_chain is null or store_type = 'supermercado');
