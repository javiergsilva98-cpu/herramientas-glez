"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidSpanishPhone, normalizePhone } from "@/lib/phone";
import { computeSplitAmounts, type SplitInput } from "@/lib/gastos/split";
import type { SplitType } from "@/lib/types/gastos";

export async function addMember(formData: FormData) {
  const roomId = String(formData.get("room_id") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!roomId || !displayName || !isValidSpanishPhone(phone)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("room_members").insert({
    room_id: roomId,
    display_name: displayName,
    phone: normalizePhone(phone),
    role: "member",
    is_ghost: true,
    invited_by: user?.id ?? null,
  });

  revalidatePath(`/gastos/${roomId}`);
}

export async function addExpense(formData: FormData) {
  const roomId = String(formData.get("room_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "otros");
  const expenseDate = String(formData.get("expense_date") ?? "");
  const paidBy = String(formData.get("paid_by") ?? "");
  const splitType = String(formData.get("split_type") ?? "equal") as SplitType;
  const memberIds = formData.getAll("member_ids").map(String);

  if (!roomId || !description || !amount || amount <= 0 || !paidBy) return;
  if (memberIds.length === 0) return;

  const entries: SplitInput[] = memberIds.map((memberId) => ({
    memberId,
    value:
      splitType === "equal"
        ? 0
        : Number(formData.get(`share_${memberId}`) ?? 0),
  }));

  const splits = computeSplitAmounts(splitType, amount, entries);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      room_id: roomId,
      paid_by: paidBy,
      amount,
      description,
      category,
      expense_date: expenseDate || new Date().toISOString().slice(0, 10),
      split_type: splitType,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !expense) return;

  await supabase.from("expense_splits").insert(
    splits.map((s) => ({
      expense_id: expense.id,
      member_id: s.memberId,
      amount: s.amount,
      share_value: s.shareValue,
    })),
  );

  revalidatePath(`/gastos/${roomId}`);
}

export async function updateExpense(formData: FormData) {
  const roomId = String(formData.get("room_id") ?? "");
  const expenseId = String(formData.get("expense_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "otros");
  const expenseDate = String(formData.get("expense_date") ?? "");
  const paidBy = String(formData.get("paid_by") ?? "");
  const splitType = String(formData.get("split_type") ?? "equal") as SplitType;
  const memberIds = formData.getAll("member_ids").map(String);

  if (!roomId || !expenseId || !description || !amount || amount <= 0 || !paidBy)
    return;
  if (memberIds.length === 0) return;

  const entries: SplitInput[] = memberIds.map((memberId) => ({
    memberId,
    value:
      splitType === "equal"
        ? 0
        : Number(formData.get(`share_${memberId}`) ?? 0),
  }));

  const splits = computeSplitAmounts(splitType, amount, entries);

  const supabase = await createClient();

  const { error } = await supabase
    .from("expenses")
    .update({
      paid_by: paidBy,
      amount,
      description,
      category,
      expense_date: expenseDate || new Date().toISOString().slice(0, 10),
      split_type: splitType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", expenseId);

  if (error) return;

  await supabase.from("expense_splits").delete().eq("expense_id", expenseId);
  await supabase.from("expense_splits").insert(
    splits.map((s) => ({
      expense_id: expenseId,
      member_id: s.memberId,
      amount: s.amount,
      share_value: s.shareValue,
    })),
  );

  revalidatePath(`/gastos/${roomId}`);
}

export async function joinRoom(roomId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("join_room", { p_room_id: roomId });

  if (error) {
    redirect(`/gastos/${roomId}/unirse?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/gastos/${roomId}`);
}

export async function claimMember(roomId: string, memberId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_member", {
    p_member_id: memberId,
  });

  if (error || !data || data.length === 0) {
    redirect(
      `/gastos/${roomId}/unirse?miembro=${memberId}&error=${encodeURIComponent(error?.message ?? "No se pudo completar la invitación.")}`,
    );
  }

  redirect(`/gastos/${data[0].room_id}`);
}

export async function deleteExpense(roomId: string, expenseId: string) {
  const supabase = await createClient();
  await supabase.from("expenses").delete().eq("id", expenseId);
  revalidatePath(`/gastos/${roomId}`);
}

export async function recordSettlement(formData: FormData) {
  const roomId = String(formData.get("room_id") ?? "");
  const fromMemberId = String(formData.get("from_member_id") ?? "");
  const toMemberId = String(formData.get("to_member_id") ?? "");
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") ?? "bizum");
  const note = String(formData.get("note") ?? "").trim();
  if (!roomId || !fromMemberId || !toMemberId || !amount || amount <= 0) return;
  if (fromMemberId === toMemberId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("settlements").insert({
    room_id: roomId,
    from_member_id: fromMemberId,
    to_member_id: toMemberId,
    amount,
    method,
    note: note || null,
    created_by: user?.id ?? null,
  });

  revalidatePath(`/gastos/${roomId}`);
}

export async function deleteSettlement(roomId: string, settlementId: string) {
  const supabase = await createClient();
  await supabase.from("settlements").delete().eq("id", settlementId);
  revalidatePath(`/gastos/${roomId}`);
}
