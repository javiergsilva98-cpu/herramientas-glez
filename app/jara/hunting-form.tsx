"use client";

import { addHuntingDay } from "./actions";

export function HuntingForm() {
  return (
    <form
      action={addHuntingDay}
      className="jr-card jr-sans flex flex-col gap-3 rounded-lg p-4 text-sm"
    >
      <h2 className="font-medium">Añadir jornada de caza</h2>

      <label className="text-sm">
        Fecha
        <input
          type="date"
          name="event_date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="jr-input mt-1 w-full rounded-md px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Notas (cómo trabajó, incidencias...)
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
