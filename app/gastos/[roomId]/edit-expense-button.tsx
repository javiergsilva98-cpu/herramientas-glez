"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { ExpenseForm } from "./expense-form";
import { updateExpense } from "./actions";
import type { Expense, ExpenseSplit, RoomMember } from "@/lib/types/gastos";

export function EditExpenseButton({
  roomId,
  members,
  expense,
  splits,
}: {
  roomId: string;
  members: RoomMember[];
  expense: Expense;
  splits: ExpenseSplit[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Editar gasto"
        className="hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        ✎
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Editar gasto">
        <ExpenseForm
          roomId={roomId}
          members={members}
          action={updateExpense}
          expense={expense}
          splits={splits}
          submitLabel="Guardar cambios"
          onSubmit={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
