"use client";

import { useState } from "react";
import { FabButton } from "@/components/fab-button";
import { Modal } from "@/components/modal";
import { DocumentForm } from "./document-form";

export function AddDocumentButton({
  vehicleId,
  color,
}: {
  vehicleId: string;
  color: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FabButton color={color} label="Añadir documento" onClick={() => setOpen(true)} />
      <Modal open={open} onClose={() => setOpen(false)} title="Añadir documento">
        <DocumentForm vehicleId={vehicleId} onSubmit={() => setOpen(false)} />
      </Modal>
    </>
  );
}
