"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isValidSpanishPhone, normalizePhone } from "@/lib/phone";

export async function setPhone(formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();
  if (!isValidSpanishPhone(phone)) {
    return { error: "Introduce un teléfono español válido (9 dígitos)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No has iniciado sesión." };

  const { error } = await supabase
    .from("profiles")
    .update({ phone: normalizePhone(phone) })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/gastos");
  return { error: null };
}

export async function createRoom(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const roomType = String(formData.get("room_type") ?? "general");
  const currency = String(formData.get("currency") ?? "EUR");
  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.phone) return;

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({ name, room_type: roomType, currency, created_by: user.id })
    .select("id")
    .single();

  if (error || !room) return;

  await supabase.from("room_members").insert({
    room_id: room.id,
    user_id: user.id,
    phone: profile.phone,
    display_name: profile.display_name,
    role: "admin",
    is_ghost: false,
    claimed_at: new Date().toISOString(),
  });

  redirect(`/gastos/${room.id}`);
}

export async function deleteRoom(roomId: string) {
  const supabase = await createClient();
  await supabase.from("rooms").delete().eq("id", roomId);
  revalidatePath("/gastos");
}
