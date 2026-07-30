"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { HealthEventType } from "@/lib/types/jara";

export async function addHealthEvent(formData: FormData) {
  const eventType = String(formData.get("event_type") ?? "") as HealthEventType;
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const nextDueDate = String(formData.get("next_due_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!eventType) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("jara_health_events").insert({
    event_type: eventType,
    event_date: eventDate || new Date().toISOString().slice(0, 10),
    next_due_date: nextDueDate || null,
    notes: notes || null,
    created_by: user?.id ?? null,
  });

  revalidatePath("/jara");
}

export async function deleteHealthEvent(eventId: string) {
  const supabase = await createClient();
  await supabase.from("jara_health_events").delete().eq("id", eventId);
  revalidatePath("/jara");
}

export async function addHuntingDay(formData: FormData) {
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("hunting_days").insert({
    event_date: eventDate || new Date().toISOString().slice(0, 10),
    notes: notes || null,
    created_by: user?.id ?? null,
  });

  revalidatePath("/jara");
}

export async function deleteHuntingDay(dayId: string) {
  const supabase = await createClient();
  await supabase.from("hunting_days").delete().eq("id", dayId);
  revalidatePath("/jara");
}

export async function addGroomingReminder(formData: FormData) {
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const nextDueDate = String(formData.get("next_due_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("grooming_reminders").insert({
    event_date: eventDate || new Date().toISOString().slice(0, 10),
    next_due_date: nextDueDate || null,
    notes: notes || null,
    created_by: user?.id ?? null,
  });

  revalidatePath("/jara");
}

export async function deleteGroomingReminder(reminderId: string) {
  const supabase = await createClient();
  await supabase.from("grooming_reminders").delete().eq("id", reminderId);
  revalidatePath("/jara");
}
