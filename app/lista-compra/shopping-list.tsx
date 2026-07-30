"use client";

import { useState } from "react";
import type { ShoppingItem, StoreType } from "@/lib/types/shopping";
import {
  CATEGORIES,
  QUANTITY_UNITS,
  STORE_CHAINS,
  STORE_TYPES,
  categoryLabel,
  storeChainLabel,
  storeTypeLabel,
} from "./constants";
import {
  bulkUpdateItems,
  clearChecked,
  deleteItem,
  toggleItem,
  updateItem,
} from "./actions";

export function ShoppingList({ items }: { items: ShoppingItem[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulkEditing, setBulkEditing] = useState(false);

  const pending = items.filter((item) => !item.is_checked);
  const checked = items.filter((item) => item.is_checked);
  const selectedIds = Object.keys(selected).filter((id) => selected[id]);
  const editingItem = items.find((item) => item.id === editingId) ?? null;

  const groups: { label: string; items: ShoppingItem[] }[] = [];
  for (const cat of CATEGORIES) {
    const catItems = pending.filter((item) => item.category === cat.value);
    if (catItems.length > 0) groups.push({ label: cat.label, items: catItems });
  }
  const uncategorized = pending.filter((item) => !item.category);
  if (uncategorized.length > 0) {
    groups.push({ label: "Sin categoría", items: uncategorized });
  }

  function toggleSelected(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex flex-col gap-4">
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-900">
          <span>{selectedIds.length} seleccionados</span>
          <div className="flex gap-3">
            <button
              onClick={() => setBulkEditing(true)}
              className="underline underline-offset-2"
            >
              Editar selección
            </button>
            <button
              onClick={() => setSelected({})}
              className="text-neutral-500 underline underline-offset-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {editingItem && (
        <SingleEditPanel
          item={editingItem}
          onClose={() => setEditingId(null)}
        />
      )}

      {bulkEditing && (
        <BulkEditPanel
          ids={selectedIds}
          onClose={() => {
            setBulkEditing(false);
            setSelected({});
          }}
        />
      )}

      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {group.label}
            </h3>
            <ul className="flex flex-col gap-2">
              {group.items.map((item) => (
                <Item
                  key={item.id}
                  item={item}
                  selected={!!selected[item.id]}
                  onToggleSelected={() => toggleSelected(item.id)}
                  onEdit={() => setEditingId(item.id)}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {pending.length === 0 && (
        <p className="text-sm text-neutral-500">No hay nada pendiente. 🎉</p>
      )}

      {checked.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm text-neutral-500">
            Comprados ({checked.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-2">
            {checked.map((item) => (
              <Item
                key={item.id}
                item={item}
                selected={!!selected[item.id]}
                onToggleSelected={() => toggleSelected(item.id)}
                onEdit={() => setEditingId(item.id)}
              />
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
    </div>
  );
}

function Item({
  item,
  selected,
  onToggleSelected,
  onEdit,
}: {
  item: ShoppingItem;
  selected: boolean;
  onToggleSelected: () => void;
  onEdit: () => void;
}) {
  const toggle = toggleItem.bind(null, item.id, !item.is_checked);
  const remove = deleteItem.bind(null, item.id);
  const store = storeTypeLabel(item.store_type);
  const chain = storeChainLabel(item.store_chain);
  const category = categoryLabel(item.category);

  return (
    <li
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
        item.is_urgent
          ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
          : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggleSelected}
        className="h-4 w-4 shrink-0"
        aria-label="Seleccionar"
      />
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
      <div className="flex-1">
        <div
          className={
            item.is_checked
              ? "text-neutral-400 line-through"
              : item.is_urgent
                ? "font-semibold text-red-700 dark:text-red-400"
                : ""
          }
        >
          {item.is_urgent && !item.is_checked && (
            <span className="mr-1 text-xs font-bold uppercase">Urgente ·</span>
          )}
          {item.name}
          <span className="ml-2 text-sm font-normal text-neutral-500">
            {item.quantity} {item.quantity_unit}
          </span>
        </div>
        {(store || chain || category) && (
          <div className="text-xs text-neutral-500">
            {[chain ?? store, category].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
      <button
        onClick={onEdit}
        className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        Editar
      </button>
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

function SingleEditPanel({
  item,
  onClose,
}: {
  item: ShoppingItem;
  onClose: () => void;
}) {
  const [storeType, setStoreType] = useState<StoreType | "">(
    item.store_type ?? "",
  );

  return (
    <form
      action={updateItem}
      onSubmit={onClose}
      className="flex flex-col gap-3 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Editar producto</h2>
        <button type="button" onClick={onClose} className="text-neutral-500">
          ✕
        </button>
      </div>

      <input type="hidden" name="id" value={item.id} />

      <label className="text-sm">
        Producto
        <input
          name="name"
          defaultValue={item.name}
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Cantidad
          <input
            type="number"
            step="any"
            min="0"
            name="quantity"
            defaultValue={item.quantity}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex-1 text-sm">
          Unidad
          <select
            name="quantity_unit"
            defaultValue={item.quantity_unit}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          >
            {QUANTITY_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="text-sm">
        Tienda
        <select
          name="store_type"
          value={storeType}
          onChange={(e) => setStoreType(e.target.value as StoreType | "")}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">Sin especificar</option>
          {STORE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {storeType === "supermercado" && (
        <label className="text-sm">
          Supermercado
          <select
            name="store_chain"
            defaultValue={item.store_chain ?? ""}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">Cualquiera</option>
            {STORE_CHAINS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="text-sm">
        Categoría (pasillo)
        <select
          name="category"
          defaultValue={item.category ?? ""}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">Sin especificar</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_urgent"
          defaultChecked={item.is_urgent}
          className="h-4 w-4"
        />
        Urgente
      </label>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
      >
        Guardar
      </button>
    </form>
  );
}

function BulkEditPanel({
  ids,
  onClose,
}: {
  ids: string[];
  onClose: () => void;
}) {
  const [storeType, setStoreType] = useState<StoreType | "">("");

  return (
    <form
      action={bulkUpdateItems}
      onSubmit={onClose}
      className="flex flex-col gap-4 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Editar {ids.length} productos</h2>
        <button type="button" onClick={onClose} className="text-neutral-500">
          ✕
        </button>
      </div>

      {ids.map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}

      <fieldset className="flex flex-col gap-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="apply_store" className="h-4 w-4" />
          Cambiar tienda
        </label>
        <select
          name="store_type"
          value={storeType}
          onChange={(e) => setStoreType(e.target.value as StoreType | "")}
          className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">Sin especificar</option>
          {STORE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {storeType === "supermercado" && (
          <select
            name="store_chain"
            defaultValue=""
            className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">Cualquiera</option>
            {STORE_CHAINS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="apply_urgent" className="h-4 w-4" />
          Cambiar urgencia
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_urgent" className="h-4 w-4" />
          Marcar como urgente
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="apply_unit" className="h-4 w-4" />
          Cambiar unidad
        </label>
        <select
          name="quantity_unit"
          defaultValue="unidades"
          className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {QUANTITY_UNITS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="flex flex-col gap-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="apply_category" className="h-4 w-4" />
          Cambiar categoría (pasillo)
        </label>
        <select
          name="category"
          defaultValue=""
          className="rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">Sin especificar</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </fieldset>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
      >
        Aplicar a {ids.length} productos
      </button>
    </form>
  );
}
