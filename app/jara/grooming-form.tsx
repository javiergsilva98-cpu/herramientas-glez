"use client";

import { addGroomingReminder } from "./actions";

export function GroomingForm() {
  return (
    <form
      action={addGroomingReminder}
      className="jr-card jr-sans flex flex-col gap-3 rounded-lg p-4 text-sm"
    >
      <h2 className="font-medium">Añadir peluquería/baño</h2>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Fecha
          <input
            type="date"
            name="event_date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="jr-input mt-1 w-full rounded-md px-3 py-2"
          />
        </label>
        <label className="flex-1 text-sm">
          Próxima (opcional)
          <input
            type="date"
            name="next_due_date"
            className="jr-input mt-1 w-full rounded-md px-3 py-2"
          />
        </label>
      </div>

      <label className="text-sm">
        Notas
        <textarea
          name="notes"
          rows={2}
          className="jr-input mt-1 w-full rounded-md px-3 py-2"
        />
      </label>

      <button type="submit" className="jr-button rounded-md px-3 py-2">
        Añadir
      </button>
    </form>
  );
}
