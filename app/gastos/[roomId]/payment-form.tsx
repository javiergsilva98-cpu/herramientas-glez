"use client";

import { recordSettlement } from "./actions";
import type { RoomMember } from "@/lib/types/gastos";

const METHODS: { value: string; label: string }[] = [
  { value: "bizum", label: "Bizum" },
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
];

export function PaymentForm({
  roomId,
  members,
  onSubmit,
}: {
  roomId: string;
  members: RoomMember[];
  onSubmit?: () => void;
}) {
  return (
    <form action={recordSettlement} onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="room_id" value={roomId} />

      <label className="text-sm">
        De
        <select
          name="from_member_id"
          required
          defaultValue=""
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="" disabled>
            Selecciona quién paga
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        A
        <select
          name="to_member_id"
          required
          defaultValue=""
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="" disabled>
            Selecciona quién recibe
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
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

      <label className="text-sm">
        Método
        <select
          name="method"
          defaultValue="bizum"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
      >
        Registrar pago
      </button>
    </form>
  );
}
