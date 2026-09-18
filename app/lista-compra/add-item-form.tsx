"use client";

import { useRef } from "react";
import { SubmitButton } from "@/components/submit-button";
import { addItem } from "./actions";

export function AddItemForm() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData: FormData) => {
        // Limpiamos el campo al instante para poder seguir metiendo
        // productos sin esperar a que vuelva el servidor.
        formRef.current?.reset();
        return addItem(formData);
      }}
      className="lc-mono mb-6 flex gap-2 text-sm"
    >
      <input
        name="name"
        required
        placeholder="Añadir producto…"
        className="lc-input lc-mono flex-1 rounded-md px-3 py-2"
      />
      <SubmitButton
        className="rounded-md px-3 py-2 font-semibold text-white"
        style={{ backgroundColor: "var(--lc-accent)" }}
      >
        +
      </SubmitButton>
    </form>
  );
}
