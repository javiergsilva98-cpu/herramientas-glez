"use client";

import { addMember } from "./actions";

export function AddMemberForm({ roomId }: { roomId: string }) {
  return (
    <form
      action={addMember}
      className="flex flex-col gap-3 rounded-lg border border-neutral-300 p-4 dark:border-neutral-700"
    >
      <input type="hidden" name="room_id" value={roomId} />
      <h2 className="font-medium">Añadir miembro</h2>
      <label className="text-sm">
        Nombre
        <input
          name="display_name"
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>
      <label className="text-sm">
        Teléfono
        <input
          name="phone"
          required
          placeholder="600 000 000"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </label>
      <p className="text-xs text-neutral-500">
        No hace falta que tenga cuenta: se añade como miembro &quot;fantasma&quot;
        y podrá reclamarlo si se registra con ese mismo teléfono.
      </p>
      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
      >
        Añadir
      </button>
    </form>
  );
}
