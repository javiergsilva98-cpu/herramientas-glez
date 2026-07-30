"use client";

import { useState } from "react";
import { addMaintenance } from "./actions";
import { MAINTENANCE_TYPE_SUGGESTIONS } from "../constants";
import type { PerformedBy } from "@/lib/types/garaje";

export function MaintenanceForm({
  vehicleId,
  onSubmit,
}: {
  vehicleId: string;
  onSubmit?: () => void;
}) {
  const [performedBy, setPerformedBy] = useState<PerformedBy>("taller");

  return (
    <form action={addMaintenance} onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="vehicle_id" value={vehicleId} />

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Fecha
          <input
            type="date"
            name="record_date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex-1 text-sm">
          Km (opcional)
          <input
            type="number"
            name="km"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <label className="text-sm">
        Tipo
        <input
          name="maintenance_type"
          required
          list="maintenance-type-suggestions"
          placeholder="Ej. Cambio de aceite"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <datalist id="maintenance-type-suggestions">
          {MAINTENANCE_TYPE_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>

      <label className="text-sm">
        Hecho por
        <select
          name="performed_by"
          value={performedBy}
          onChange={(e) => setPerformedBy(e.target.value as PerformedBy)}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="taller">Taller</option>
          <option value="yo_mismo">Yo mismo</option>
        </select>
      </label>

      {performedBy === "taller" && (
        <label className="text-sm">
          Nombre del taller
          <input
            name="workshop_name"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      )}

      <label className="text-sm">
        Precio (€)
        <input
          type="number"
          step="0.01"
          min="0"
          name="price"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Próximo aviso a los km
          <input
            type="number"
            name="interval_km"
            placeholder="Ej. 10000"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex-1 text-sm">
          Próximo aviso en fecha
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
        Añadir mantenimiento
      </button>
    </form>
  );
}
