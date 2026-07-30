import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ShoppingItem, StoreType } from "@/lib/types/shopping";
import { STORE_TYPES } from "./constants";
import { addItem } from "./actions";
import { ShoppingList } from "./shopping-list";

const VALID_STORE_TYPES = STORE_TYPES.map((t) => t.value);

export default async function ListaCompraPage({
  searchParams,
}: {
  searchParams: Promise<{ tienda?: string }>;
}) {
  const { tienda } = await searchParams;
  const storeFilter = VALID_STORE_TYPES.includes(tienda as StoreType)
    ? (tienda as StoreType)
    : null;

  const supabase = await createClient();
  let query = supabase
    .from("shopping_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (storeFilter) {
    query = query.eq("store_type", storeFilter);
  }

  const { data, error } = await query;
  const items = (data ?? []) as ShoppingItem[];

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← Inicio
        </Link>
      </div>

      <h1 className="mb-4 text-2xl font-semibold">🛒 Lista de la compra</h1>

      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <FilterTab label="Todos" active={!storeFilter} href="/lista-compra" />
        {STORE_TYPES.map((t) => (
          <FilterTab
            key={t.value}
            label={t.label}
            active={storeFilter === t.value}
            href={`/lista-compra?tienda=${t.value}`}
          />
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          No se ha podido cargar la lista. Comprueba que la migración 002 se
          haya ejecutado en Supabase.
        </p>
      )}

      <form action={addItem} className="mb-6 flex gap-2">
        <input
          name="name"
          required
          placeholder="Producto"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
        >
          Añadir
        </button>
      </form>

      <ShoppingList items={items} />
    </main>
  );
}

function FilterTab({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
          : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
      }`}
    >
      {label}
    </Link>
  );
}
