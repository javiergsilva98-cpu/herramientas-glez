"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { VehicleType } from "@/lib/types/garaje";

export async function addVehicle(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const vehicleType = String(formData.get("vehicle_type") ?? "") as VehicleType;
  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim();

  if (!name || (vehicleType !== "moto" && vehicleType !== "coche")) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("vehicles").insert({
    name,
    vehicle_type: vehicleType,
    brand: brand || null,
    model: model || null,
    year: yearRaw ? Number(yearRaw) : null,
    plate: plate || null,
    created_by: user?.id ?? null,
  });

  revalidatePath("/garaje");
}

export async function deleteVehicle(vehicleId: string) {
  const supabase = await createClient();
  await supabase.from("vehicles").delete().eq("id", vehicleId);
  revalidatePath("/garaje");
}
