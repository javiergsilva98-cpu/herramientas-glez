"use client";

import { addHealthEvent } from "./actions";
import { HEALTH_EVENT_TYPES } from "./constants";

export function HealthForm() {
  return (
    <form
      action={addHealthEvent}
      className="jr-card jr-sans flex flex-col gap-3 rounded-lg p-4 text-sm"
    >
      <h2 className="font-medium">Añadir evento de salud</h2>

      <label className="text-sm">
        Tipo
        <select
          name="event_type"
          required
          className="jr-input mt-1 w-full rounded-md px-3 py-2"
        >
          {HEALTH_EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

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

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Lugar (opcional)
          <input
            name="place"
            placeholder="Ej. Urgencias veterinarias"
            className="jr-input mt-1 w-full rounded-md px-3 py-2"
          />
        </label>
        <label className="flex-1 text-sm">
          Precio € (opcional)
          <input
            type="number"
            step="0.01"
            min="0"
            name="price"
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
