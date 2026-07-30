"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DocumentType, PerformedBy } from "@/lib/types/garaje";

export async function addMaintenance(formData: FormData) {
  const vehicleId = String(formData.get("vehicle_id") ?? "");
  const recordDate = String(formData.get("record_date") ?? "");
  const kmRaw = String(formData.get("km") ?? "").trim();
  const maintenanceType = String(formData.get("maintenance_type") ?? "").trim();
  const performedBy = String(formData.get("performed_by") ?? "") as PerformedBy;
  const workshopName = String(formData.get("workshop_name") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const intervalKmRaw = String(formData.get("interval_km") ?? "").trim();
  const nextDueDate = String(formData.get("next_due_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (
    !vehicleId ||
    !maintenanceType ||
    (performedBy !== "taller" && performedBy !== "yo_mismo")
  )
    return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("maintenance_records").insert({
    vehicle_id: vehicleId,
    record_date: recordDate || new Date().toISOString().slice(0, 10),
    km: kmRaw ? Number(kmRaw) : null,
    maintenance_type: maintenanceType,
    performed_by: performedBy,
    workshop_name: performedBy === "taller" && workshopName ? workshopName : null,
    price: priceRaw ? Number(priceRaw) : null,
    interval_km: intervalKmRaw ? Number(intervalKmRaw) : null,
    next_due_date: nextDueDate || null,
    notes: notes || null,
    created_by: user?.id ?? null,
  });

  revalidatePath(`/garaje/${vehicleId}`);
  revalidatePath("/garaje");
}

export async function deleteMaintenance(vehicleId: string, recordId: string) {
  const supabase = await createClient();
  await supabase.from("maintenance_records").delete().eq("id", recordId);
  revalidatePath(`/garaje/${vehicleId}`);
  revalidatePath("/garaje");
}

export async function addDocument(formData: FormData) {
  const vehicleId = String(formData.get("vehicle_id") ?? "");
  const documentType = String(formData.get("document_type") ?? "") as DocumentType;
  const expiryDate = String(formData.get("expiry_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const file = formData.get("file");

  if (!vehicleId || !documentType) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fileUrl: string | null = null;
  let fileName: string | null = null;

  if (file instanceof File && file.size > 0) {
    const ext = file.name.split(".").pop();
    const path = `${vehicleId}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;
    const { error: uploadError } = await supabase.storage
      .from("vehicle-documents")
      .upload(path, file, { contentType: file.type || undefined });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("vehicle-documents")
        .getPublicUrl(path);
      fileUrl = publicUrlData.publicUrl;
      fileName = file.name;
    }
  }

  await supabase.from("vehicle_documents").insert({
    vehicle_id: vehicleId,
    document_type: documentType,
    expiry_date: expiryDate || null,
    notes: notes || null,
    file_url: fileUrl,
    file_name: fileName,
    created_by: user?.id ?? null,
  });

  revalidatePath(`/garaje/${vehicleId}`);
  revalidatePath("/garaje");
}

export async function deleteDocument(vehicleId: string, documentId: string) {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("vehicle_documents")
    .select("file_url")
    .eq("id", documentId)
    .single();

  await supabase.from("vehicle_documents").delete().eq("id", documentId);

  if (doc?.file_url) {
    const path = doc.file_url.split("/vehicle-documents/")[1];
    if (path) await supabase.storage.from("vehicle-documents").remove([path]);
  }

  revalidatePath(`/garaje/${vehicleId}`);
  revalidatePath("/garaje");
}
