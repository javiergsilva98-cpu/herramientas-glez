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

type CreateRoomState = { error: string | null };

export async function createRoom(
  _prev: CreateRoomState,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "").trim();
  const roomType = String(formData.get("room_type") ?? "general");
  const currency = String(formData.get("currency") ?? "EUR");
  if (!name) return { error: "Ponle un nombre a la sala." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No has iniciado sesión." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.phone) {
    return { error: "Configura tu teléfono antes de crear una sala." };
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({ name, room_type: roomType, currency, created_by: user.id })
    .select("id")
    .single();

  if (roomError || !room) {
    return {
      error: `No se pudo crear la sala: ${roomError?.message ?? "sin datos devueltos (revisa las políticas RLS de 'rooms')."}`,
    };
  }

  const { error: memberError } = await supabase.from("room_members").insert({
    room_id: room.id,
    user_id: user.id,
    phone: profile.phone,
    display_name: profile.display_name,
    role: "admin",
    is_ghost: false,
    claimed_at: new Date().toISOString(),
  });

  if (memberError) {
    return {
      error: `Sala creada, pero no se pudo añadir tu membresía de admin: ${memberError.message}`,
    };
  }

  redirect(`/gastos/${room.id}`);
}

export async function deleteRoom(roomId: string) {
  const supabase = await createClient();
  await supabase.from("rooms").delete().eq("id", roomId);
  revalidatePath("/gastos");
}
