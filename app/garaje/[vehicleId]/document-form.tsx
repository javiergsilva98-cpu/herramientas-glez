"use client";

import { addDocument } from "./actions";
import { DOCUMENT_TYPES } from "../constants";

export function DocumentForm({
  vehicleId,
  onSubmit,
}: {
  vehicleId: string;
  onSubmit?: () => void;
}) {
  return (
    <form action={addDocument} onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="vehicle_id" value={vehicleId} />

      <label className="text-sm">
        Tipo
        <select
          name="document_type"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {DOCUMENT_TYPES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Fecha de caducidad
        <input
          type="date"
          name="expiry_date"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <label className="text-sm">
        Notas
        <textarea
          name="notes"
          rows={2}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <label className="text-sm">
        Archivo (PDF o imagen)
        <input
          type="file"
          name="file"
          accept="application/pdf,image/*"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
      >
        Añadir documento
      </button>
    </form>
  );
}
