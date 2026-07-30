import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ShoppingItem } from "@/lib/types/shopping";
import { addItem, clearChecked, deleteItem, toggleItem } from "./actions";

export default async function ListaCompraPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shopping_items")
    .select("*")
    .order("created_at", { ascending: true });

  const items = (data ?? []) as ShoppingItem[];
  const pending = items.filter((item) => !item.is_checked);
  const checked = items.filter((item) => item.is_checked);

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← Inicio
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-semibold">🛒 Lista de la compra</h1>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          No se ha podido cargar la lista. Comprueba que la tabla{" "}
          <code>shopping_items</code> exista en Supabase.
        </p>
      )}

      <form action={addItem} className="mb-6 flex gap-2">
        <input
          name="name"
          required
          placeholder="Producto"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          name="quantity"
          placeholder="Cant."
          className="w-20 rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
        >
          Añadir
        </button>
      </form>

      <ul className="mb-4 flex flex-col gap-2">
        {pending.map((item) => (
          <Item key={item.id} item={item} />
        ))}
      </ul>

      {pending.length === 0 && (
        <p className="mb-4 text-sm text-neutral-500">
          No hay nada pendiente. 🎉
        </p>
      )}

      {checked.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-neutral-500">
            Comprados ({checked.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-2">
            {checked.map((item) => (
              <Item key={item.id} item={item} />
            ))}
          </ul>
          <form action={clearChecked} className="mt-3">
            <button
              type="submit"
              className="text-sm text-red-600 underline underline-offset-2"
            >
              Vaciar comprados
            </button>
          </form>
        </details>
      )}
    </main>
  );
}

function Item({ item }: { item: ShoppingItem }) {
  const toggle = toggleItem.bind(null, item.id, !item.is_checked);
  const remove = deleteItem.bind(null, item.id);

  return (
    <li className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800">
      <form action={toggle}>
        <button
          type="submit"
          aria-label="Marcar como comprado"
          className={`h-5 w-5 shrink-0 rounded-full border ${
            item.is_checked
              ? "border-green-600 bg-green-600"
              : "border-neutral-400"
          }`}
        />
      </form>
      <span
        className={`flex-1 ${item.is_checked ? "text-neutral-400 line-through" : ""}`}
      >
        {item.name}
        {item.quantity && (
          <span className="ml-2 text-sm text-neutral-500">
            {item.quantity}
          </span>
        )}
      </span>
      <form action={remove}>
        <button
          type="submit"
          aria-label="Eliminar"
          className="text-neutral-400 hover:text-red-600"
        >
          ✕
        </button>
      </form>
    </li>
  );
}
