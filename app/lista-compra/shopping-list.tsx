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
        <div className="lc-input flex items-center justify-between rounded-lg px-3 py-2 text-sm">
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
              className="lc-soft underline underline-offset-2"
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
            <div className="lc-cat mb-2">{group.label}</div>
            <ul className="flex flex-col">
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
        <p className="lc-soft lc-mono text-sm">No hay nada pendiente. 🎉</p>
      )}

      {checked.length > 0 && (
        <details>
          <summary className="lc-soft lc-mono cursor-pointer text-sm">
            Comprados ({checked.length})
          </summary>
          <ul className="mt-2 flex flex-col">
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
              className="text-sm underline underline-offset-2"
              style={{ color: "var(--lc-urgent)" }}
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
      className={`lc-row flex items-center gap-2 py-2 text-sm ${
        item.is_urgent ? "urgent" : ""
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
          className="h-4 w-4 shrink-0 rounded-sm border-2"
          style={{
            borderColor: item.is_checked ? "var(--lc-accent)" : "var(--lc-hair)",
            backgroundColor: item.is_checked ? "var(--lc-accent)" : "transparent",
          }}
        />
      </form>
      <div className="lc-mono flex-1">
        <div
          className={
            item.is_checked
              ? "lc-soft line-through"
              : item.is_urgent
                ? "font-semibold"
                : ""
          }
          style={item.is_urgent && !item.is_checked ? { color: "var(--lc-urgent)" } : undefined}
        >
          {item.is_urgent && !item.is_checked && (
            <span className="lc-stamp mr-2">Urgente</span>
          )}
          {item.name}
        </div>
        {(store || chain || category) && (
          <div className="lc-soft text-xs">
            {[chain ?? store, category].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
      <span className="lc-mono lc-soft text-xs">
        {item.quantity} {item.quantity_unit}
      </span>
      <button
        onClick={onEdit}
        className="text-xs underline underline-offset-2 hover:opacity-70"
      >
        Editar
      </button>
      <form action={remove}>
        <button
          type="submit"
          aria-label="Eliminar"
          className="lc-soft hover:opacity-70"
          style={{ color: "var(--lc-urgent)" }}
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
      className="lc-card flex flex-col gap-3 rounded-lg p-4 text-sm"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Editar producto</h2>
        <button type="button" onClick={onClose} className="lc-soft">
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
          className="lc-input mt-1 w-full rounded-md px-3 py-2"
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
            className="lc-input mt-1 w-full rounded-md px-3 py-2"
          />
        </label>
        <label className="flex-1 text-sm">
          Unidad
          <select
            name="quantity_unit"
            defaultValue={item.quantity_unit}
            className="lc-input mt-1 w-full rounded-md px-3 py-2"
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
          className="lc-input mt-1 w-full rounded-md px-3 py-2"
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
            className="lc-input mt-1 w-full rounded-md px-3 py-2"
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
          className="lc-input mt-1 w-full rounded-md px-3 py-2"
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
        className="rounded-md px-3 py-2 font-medium text-white"
        style={{ backgroundColor: "var(--lc-accent)" }}
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
      className="lc-card flex flex-col gap-4 rounded-lg p-4 text-sm"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Editar {ids.length} productos</h2>
        <button type="button" onClick={onClose} className="lc-soft">
          ✕
        </button>
      </div>

      {ids.map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}

      <fieldset className="lc-hair flex flex-col gap-2 rounded-md border p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="apply_store" className="h-4 w-4" />
          Cambiar tienda
        </label>
        <select
          name="store_type"
          value={storeType}
          onChange={(e) => setStoreType(e.target.value as StoreType | "")}
          className="lc-input rounded-md px-3 py-2"
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
            className="lc-input rounded-md px-3 py-2"
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

      <fieldset className="lc-hair flex flex-col gap-2 rounded-md border p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="apply_urgent" className="h-4 w-4" />
          Cambiar urgencia
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_urgent" className="h-4 w-4" />
          Marcar como urgente
        </label>
      </fieldset>

      <fieldset className="lc-hair flex flex-col gap-2 rounded-md border p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="apply_unit" className="h-4 w-4" />
          Cambiar unidad
        </label>
        <select
          name="quantity_unit"
          defaultValue="unidades"
          className="lc-input rounded-md px-3 py-2"
        >
          {QUANTITY_UNITS.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </fieldset>

      <fieldset className="lc-hair flex flex-col gap-2 rounded-md border p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="apply_category" className="h-4 w-4" />
          Cambiar categoría (pasillo)
        </label>
        <select
          name="category"
          defaultValue=""
          className="lc-input rounded-md px-3 py-2"
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
        className="rounded-md px-3 py-2 font-medium text-white"
        style={{ backgroundColor: "var(--lc-accent)" }}
      >
        Aplicar a {ids.length} productos
      </button>
    </form>
  );
}
