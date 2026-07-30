"use client";

import { useState } from "react";
import { addExpense } from "./actions";
import type { RoomMember, SplitType } from "@/lib/types/gastos";

const SPLIT_TYPES: { value: SplitType; label: string }[] = [
  { value: "equal", label: "Igual" },
  { value: "exact", label: "Importes exactos" },
  { value: "percentage", label: "Porcentaje" },
  { value: "shares", label: "Partes" },
];

export function AddExpenseForm({
  roomId,
  members,
}: {
  roomId: string;
  members: RoomMember[];
}) {
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(members.map((m) => [m.id, true])),
  );

  return (
    <form
      action={addExpense}
      className="flex flex-col gap-3 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700"
    >
      <input type="hidden" name="room_id" value={roomId} />
      <h2 className="font-medium">Añadir gasto</h2>

      <label className="text-sm">
        Descripción
        <input
          name="description"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Importe (€)
          <input
            type="number"
            step="0.01"
            min="0.01"
            name="amount"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex-1 text-sm">
          Fecha
          <input
            type="date"
            name="expense_date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <label className="text-sm">
        Categoría
        <input
          name="category"
          defaultValue="otros"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <label className="text-sm">
        Pagado por
        <select
          name="paid_by"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Reparto
        <select
          name="split_type"
          value={splitType}
          onChange={(e) => setSplitType(e.target.value as SplitType)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {SPLIT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Entre quién</span>
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="member_ids"
              value={m.id}
              checked={!!selected[m.id]}
              onChange={() =>
                setSelected((prev) => ({ ...prev, [m.id]: !prev[m.id] }))
              }
              className="h-4 w-4"
            />
            <span className="flex-1 text-sm">{m.display_name}</span>
            {splitType !== "equal" && selected[m.id] && (
              <input
                type="number"
                step="any"
                name={`share_${m.id}`}
                placeholder={
                  splitType === "exact"
                    ? "€"
                    : splitType === "percentage"
                      ? "%"
                      : "partes"
                }
                className="w-20 rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
      >
        Añadir gasto
      </button>
    </form>
  );
}
