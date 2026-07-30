"use client";

import { useActionState } from "react";
import { setPhone } from "./actions";

const initialState = { error: null as string | null };

export function PhoneForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) =>
      (await setPhone(formData)) ?? initialState,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700"
    >
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        Para crear o unirte a salas de gastos necesitamos tu teléfono (así
        pueden identificarte otros miembros aunque aún no tengan cuenta).
      </p>
      <label className="text-sm">
        Teléfono
        <input
          name="phone"
          required
          placeholder="600 000 000"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "Guardando..." : "Guardar teléfono"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
