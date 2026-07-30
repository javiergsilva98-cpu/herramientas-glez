"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("shopping_items").insert({
    name,
    created_by: user?.id ?? null,
  });

  revalidatePath("/lista-compra");
}

export async function toggleItem(id: string, isChecked: boolean) {
  const supabase = await createClient();
  await supabase
    .from("shopping_items")
    .update({
      is_checked: isChecked,
      checked_at: isChecked ? new Date().toISOString() : null,
    })
    .eq("id", id);

  revalidatePath("/lista-compra");
}

export async function deleteItem(id: string) {
  const supabase = await createClient();
  await supabase.from("shopping_items").delete().eq("id", id);
  revalidatePath("/lista-compra");
}

export async function clearChecked() {
  const supabase = await createClient();
  await supabase.from("shopping_items").delete().eq("is_checked", true);
  revalidatePath("/lista-compra");
}

export async function updateItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const name = String(formData.get("name") ?? "").trim();
  const storeType = String(formData.get("store_type") ?? "") || null;
  const storeChain =
    storeType === "supermercado"
      ? String(formData.get("store_chain") ?? "") || null
      : null;
  const quantity = Number(formData.get("quantity")) || 1;
  const quantityUnit = String(formData.get("quantity_unit") ?? "unidades");
  const isUrgent = formData.get("is_urgent") === "on";

  const supabase = await createClient();
  await supabase
    .from("shopping_items")
    .update({
      name: name || undefined,
      store_type: storeType,
      store_chain: storeChain,
      quantity,
      quantity_unit: quantityUnit,
      is_urgent: isUrgent,
    })
    .eq("id", id);

  revalidatePath("/lista-compra");
}

export async function bulkUpdateItems(formData: FormData) {
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  if (ids.length === 0) return;

  const updates: Record<string, unknown> = {};

  if (formData.get("apply_store") === "on") {
    const storeType = String(formData.get("store_type") ?? "") || null;
    updates.store_type = storeType;
    updates.store_chain =
      storeType === "supermercado"
        ? String(formData.get("store_chain") ?? "") || null
        : null;
  }

  if (formData.get("apply_urgent") === "on") {
    updates.is_urgent = formData.get("is_urgent") === "on";
  }

  if (formData.get("apply_unit") === "on") {
    updates.quantity_unit = String(formData.get("quantity_unit") ?? "unidades");
  }

  if (Object.keys(updates).length === 0) return;

  const supabase = await createClient();
  await supabase.from("shopping_items").update(updates).in("id", ids);

  revalidatePath("/lista-compra");
}
