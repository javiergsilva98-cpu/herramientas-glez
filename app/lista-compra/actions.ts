"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addItem(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("shopping_items").insert({
    name,
    quantity: quantity || null,
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
