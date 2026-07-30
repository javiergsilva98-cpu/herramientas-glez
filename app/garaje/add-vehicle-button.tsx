"use client";

import { useState } from "react";
import { FabButton } from "@/components/fab-button";
import { Modal } from "@/components/modal";
import { VehicleForm } from "./vehicle-form";

export function AddVehicleButton({ color }: { color: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FabButton color={color} label="Añadir vehículo" onClick={() => setOpen(true)} />
      <Modal open={open} onClose={() => setOpen(false)} title="Añadir vehículo">
        <VehicleForm onSubmit={() => setOpen(false)} />
      </Modal>
    </>
  );
}
