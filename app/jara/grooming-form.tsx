"use client";

import { addGroomingReminder } from "./actions";

export function GroomingForm() {
  return (
    <form
      action={addGroomingReminder}
      className="flex flex-col gap-3 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700"
    >
      <h2 className="font-medium">Añadir peluquería/baño</h2>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Fecha
          <input
            type="date"
            name="event_date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex-1 text-sm">
          Próxima (opcional)
          <input
            type="date"
            name="next_due_date"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <label className="text-sm">
        Notas
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
