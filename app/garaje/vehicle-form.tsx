"use client";

import { addVehicle } from "./actions";

export function VehicleForm() {
  return (
    <form
      action={addVehicle}
      className="flex flex-col gap-3 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700"
    >
      <h2 className="font-medium">Añadir vehículo</h2>

      <label className="text-sm">
        Nombre
        <input
          name="name"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>

      <label className="text-sm">
        Tipo
        <select
          name="vehicle_type"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="moto">Moto</option>
          <option value="coche">Coche</option>
        </select>
      </label>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Marca
          <input
            name="brand"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex-1 text-sm">
          Modelo
          <input
            name="model"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Año
          <input
            type="number"
            name="year"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <label className="flex-1 text-sm">
          Matrícula
          <input
            name="plate"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
      </div>

      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
      >
        Añadir vehículo
      </button>
    </form>
  );
}
