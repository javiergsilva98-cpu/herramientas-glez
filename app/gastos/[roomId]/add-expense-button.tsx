"use client";

import { useState } from "react";
import { FabButton } from "@/components/fab-button";
import { Modal } from "@/components/modal";
import { ExpenseForm } from "./expense-form";
import { addExpense } from "./actions";
import type { RoomMember } from "@/lib/types/gastos";

export function AddExpenseButton({
  roomId,
  members,
  color,
}: {
  roomId: string;
  members: RoomMember[];
  color: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FabButton color={color} label="Añadir gasto" onClick={() => setOpen(true)} />
      <Modal open={open} onClose={() => setOpen(false)} title="Añadir gasto">
        <ExpenseForm
          roomId={roomId}
          members={members}
          action={addExpense}
          submitLabel="Añadir gasto"
          onSubmit={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
