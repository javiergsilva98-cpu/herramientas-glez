export type RoomType = "viaje" | "piso" | "evento" | "general";

export type Room = {
  id: string;
  name: string;
  currency: string;
  room_type: RoomType;
  created_by: string | null;
  created_at: string;
  archived_at: string | null;
};

export type RoomMember = {
  id: string;
  room_id: string;
  user_id: string | null;
  phone: string;
  display_name: string;
  role: "admin" | "member";
  is_ghost: boolean;
  claimed_at: string | null;
  created_at: string;
};

export type SplitType = "equal" | "exact" | "percentage" | "shares";

export type Expense = {
  id: string;
  room_id: string;
  paid_by: string;
  amount: number;
  description: string;
  category: string;
  expense_date: string;
  receipt_url: string | null;
  split_type: SplitType;
  created_by: string | null;
  created_at: string;
};

export type ExpenseSplit = {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number;
  share_value: number | null;
};

export type Settlement = {
  id: string;
  room_id: string;
  from_member_id: string;
  to_member_id: string;
  amount: number;
  method: "bizum" | "efectivo" | "transferencia" | "otro";
  note: string | null;
  settled_at: string;
};
