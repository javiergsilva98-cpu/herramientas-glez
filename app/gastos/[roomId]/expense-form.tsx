"use client";

import { useState } from "react";
import type { Expense, ExpenseSplit, RoomMember, SplitType } from "@/lib/types/gastos";
import { EXPENSE_CATEGORIES } from "../constants";

const SPLIT_TYPES: { value: SplitType; label: string }[] = [
  { value: "equal", label: "Igual" },
  { value: "exact", label: "Importes exactos" },
  { value: "percentage", label: "Porcentaje" },
  { value: "shares", label: "Partes" },
];

export function ExpenseForm({
  roomId,
  members,
  action,
  expense,
  splits,
  submitLabel = "Añadir gasto",
  onSubmit,
}: {
  roomId: string;
  members: RoomMember[];
  action: (formData: FormData) => void | Promise<void>;
  expense?: Expense;
  splits?: ExpenseSplit[];
  submitLabel?: string;
  onSubmit?: () => void;
}) {
  const splitByMember = new Map((splits ?? []).map((s) => [s.member_id, s]));
  const [splitType, setSplitType] = useState<SplitType>(
    expense?.split_type ?? "equal",
  );
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(
      members.map((m) => [m.id, expense ? splitByMember.has(m.id) : true]),
    ),
  );

  return (
    <form
      action={action}
      onSubmit={onSubmit}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="room_id" value={roomId} />
      {expense && <input type="hidden" name="expense_id" value={expense.id} />}

      <label className="text-sm">
        Descripción
        <input
          name="description"
          required
          defaultValue={expense?.description}
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
            defaultValue={expense?.amount}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex-1 text-sm">
          Fecha
          <input
            type="date"
            name="expense_date"
            defaultValue={
              expense?.expense_date ?? new Date().toISOString().slice(0, 10)
            }
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <label className="text-sm">
        Categoría
        <select
          name="category"
          defaultValue={expense?.category ?? "otros"}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Pagado por
        <select
          name="paid_by"
          required
          defaultValue={expense?.paid_by}
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
                defaultValue={
                  splitType === "exact"
                    ? (splitByMember.get(m.id)?.amount ?? undefined)
                    : (splitByMember.get(m.id)?.share_value ?? undefined)
                }
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
        {submitLabel}
      </button>
    </form>
  );
}
