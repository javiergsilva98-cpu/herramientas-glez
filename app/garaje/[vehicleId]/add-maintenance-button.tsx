"use client";

import { useState } from "react";
import { FabButton } from "@/components/fab-button";
import { Modal } from "@/components/modal";
import { MaintenanceForm } from "./maintenance-form";

export function AddMaintenanceButton({
  vehicleId,
  color,
}: {
  vehicleId: string;
  color: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FabButton
        color={color}
        label="Añadir mantenimiento"
        onClick={() => setOpen(true)}
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Añadir mantenimiento"
        className="gj-modal"
      >
        <MaintenanceForm vehicleId={vehicleId} onSubmit={() => setOpen(false)} />
      </Modal>
    </>
  );
}
