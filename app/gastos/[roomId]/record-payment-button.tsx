"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { PaymentForm } from "./payment-form";
import type { RoomMember } from "@/lib/types/gastos";

export function RecordPaymentButton({
  roomId,
  members,
}: {
  roomId: string;
  members: RoomMember[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        + Registrar un pago
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Registrar un pago">
        <PaymentForm roomId={roomId} members={members} onSubmit={() => setOpen(false)} />
      </Modal>
    </>
  );
}
