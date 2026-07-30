"use client";

import { useActionState } from "react";
import { createRoom } from "./actions";

const ROOM_TYPES = [
  { value: "general", label: "General" },
  { value: "viaje", label: "Viaje" },
  { value: "piso", label: "Piso" },
  { value: "evento", label: "Evento" },
];

const initialState = { error: null as string | null };

export function RoomForm() {
  const [state, formAction, pending] = useActionState(createRoom, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700"
    >
      <label className="text-sm">
        Nombre de la sala
        <input
          name="name"
          required
          placeholder="Viaje a Lisboa"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>
      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Tipo
          <select
            name="room_type"
            defaultValue="general"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          >
            {ROOM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-sm">
          Moneda
          <input
            name="currency"
            defaultValue="EUR"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "Creando..." : "Crear sala"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
