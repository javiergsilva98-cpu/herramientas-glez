import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ShoppingItem, StoreChain, StoreType } from "@/lib/types/shopping";
import { STORE_CHAINS, STORE_TYPES } from "./constants";
import { addItem } from "./actions";
import { ShoppingList } from "./shopping-list";
import { ShareButton } from "@/components/share-button";

const VALID_STORE_TYPES = STORE_TYPES.map((t) => t.value);
const VALID_STORE_CHAINS = STORE_CHAINS.map((c) => c.value);

export default async function ListaCompraPage({
  searchParams,
}: {
  searchParams: Promise<{ tienda?: string; cadena?: string }>;
}) {
  const { tienda, cadena } = await searchParams;
  const storeFilter = VALID_STORE_TYPES.includes(tienda as StoreType)
    ? (tienda as StoreType)
    : null;
  const chainFilter =
    storeFilter === "supermercado" &&
    VALID_STORE_CHAINS.includes(cadena as StoreChain)
      ? (cadena as StoreChain)
      : null;

  const supabase = await createClient();
  let query = supabase
    .from("shopping_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (storeFilter) {
    query = query.eq("store_type", storeFilter);
  }
  if (chainFilter) {
    // Los productos genéricos de supermercado (sin cadena) valen para
    // cualquier super, así que se muestran también.
    query = query.or(`store_chain.eq.${chainFilter},store_chain.is.null`);
  }

  const { data, error } = await query;
  const items = (data ?? []) as ShoppingItem[];
  const pendingCount = items.filter((i) => !i.is_checked).length;

  return (
    <div className="lc">
      <div className="lc-band px-6 pb-5 pt-6 text-white">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            <h1 className="lc-mono text-xl font-extrabold uppercase tracking-wide">
              Tienda Glez
            </h1>
            <p className="mt-0.5 text-xs text-white/85">
              Recibo · {pendingCount} pendiente{pendingCount === 1 ? "" : "s"}
            </p>
          </div>
          <ShareButton light path="/lista-compra" title="Lista de la compra" />
        </div>
      </div>
      <div className="lc-perf" />

      <main className="mx-auto max-w-md p-6">
        <div className="mb-2 flex flex-wrap gap-2 text-sm">
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

        {storeFilter === "supermercado" && (
          <div className="mb-6 flex flex-wrap gap-2 text-sm">
            <FilterTab
              label="Todos los supermercados"
              active={!chainFilter}
              href="/lista-compra?tienda=supermercado"
            />
            {STORE_CHAINS.map((c) => (
              <FilterTab
                key={c.value}
                label={c.label}
                active={chainFilter === c.value}
                href={`/lista-compra?tienda=supermercado&cadena=${c.value}`}
              />
            ))}
          </div>
        )}

        {error && (
          <p className="lc-mono mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            No se ha podido cargar la lista. Comprueba que la migración 002 se
            haya ejecutado en Supabase.
          </p>
        )}

        <form action={addItem} className="lc-mono mb-6 flex gap-2 text-sm">
          <input
            name="name"
            required
            placeholder="Añadir producto…"
            className="lc-input lc-mono flex-1 rounded-md px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-md px-3 py-2 font-semibold text-white"
            style={{ backgroundColor: "var(--lc-accent)" }}
          >
            +
          </button>
        </form>

        <ShoppingList items={items} />
      </main>
    </div>
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
      className={`lc-chip rounded-full px-3 py-1 ${active ? "active" : ""}`}
    >
      {label}
    </Link>
  );
}
