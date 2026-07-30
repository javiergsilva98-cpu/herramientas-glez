"use client";

import { addHuntingDay } from "./actions";

export function HuntingForm() {
  return (
    <form
      action={addHuntingDay}
      className="flex flex-col gap-3 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700"
    >
      <h2 className="font-medium">Añadir jornada de caza</h2>

      <label className="text-sm">
        Fecha
        <input
          type="date"
          name="event_date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <label className="text-sm">
        Notas (cómo trabajó, incidencias...)
        <textarea
          name="notes"
          rows={2}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
      >
        Añadir
      </button>
    </form>
  );
}
