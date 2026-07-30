"use client";

import { createRoom } from "./actions";

const ROOM_TYPES = [
  { value: "general", label: "General" },
  { value: "viaje", label: "Viaje" },
  { value: "piso", label: "Piso" },
  { value: "evento", label: "Evento" },
];

export function RoomForm() {
  return (
    <form
      action={createRoom}
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
        className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
      >
        Crear sala
      </button>
    </form>
  );
}
