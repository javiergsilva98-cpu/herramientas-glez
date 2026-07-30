import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import type { Expense, ExpenseSplit, RoomMember, Settlement } from "@/lib/types/gastos";
import { computeBalances, detailedDebts, simplifyDebts } from "@/lib/gastos/balances";
import { AddMemberForm } from "./add-member-form";
import { AddExpenseForm } from "./add-expense-form";
import { deleteExpense, recordSettlement } from "./actions";

type Tab = "gastos" | "miembros" | "balances";

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { roomId } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab =
    tabParam === "miembros" || tabParam === "balances" ? tabParam : "gastos";

  const supabase = await createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (!room) notFound();

  const { data: membersData } = await supabase
    .from("room_members")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  const members = (membersData ?? []) as RoomMember[];
  const memberName = (id: string) =>
    members.find((m) => m.id === id)?.display_name ?? "?";

  const { data: expensesData } = await supabase
    .from("expenses")
    .select("*")
    .eq("room_id", roomId)
    .is("deleted_at", null)
    .order("expense_date", { ascending: false });
  const expenses = (expensesData ?? []) as Expense[];

  const expenseIds = expenses.map((e) => e.id);
  const { data: splitsData } =
    expenseIds.length > 0
      ? await supabase
          .from("expense_splits")
          .select("*")
          .in("expense_id", expenseIds)
      : { data: [] };
  const splits = (splitsData ?? []) as ExpenseSplit[];

  const { data: settlementsData } = await supabase
    .from("settlements")
    .select("*")
    .eq("room_id", roomId);
  const settlements = (settlementsData ?? []) as Settlement[];

  const balances = computeBalances(
    members.map((m) => m.id),
    expenses,
    splits,
    settlements,
  );
  const simplified = simplifyDebts(balances);
  const detailed = detailedDebts(expenses, splits);

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/gastos" className="text-sm text-neutral-500 hover:underline">
          ← Salas
        </Link>
        <ShareButton
          path={`/gastos/${roomId}/unirse`}
          title={`Únete a "${room.name}"`}
          text={`Te invito a la sala de gastos "${room.name}" en Herramientas Glez.`}
        />
      </div>

      <h1 className="mb-4 text-2xl font-semibold">{room.name}</h1>

      <div className="mb-6 flex gap-2 text-sm">
        <TabLink roomId={roomId} tab="gastos" active={tab === "gastos"}>
          Gastos
        </TabLink>
        <TabLink roomId={roomId} tab="miembros" active={tab === "miembros"}>
          Miembros
        </TabLink>
        <TabLink roomId={roomId} tab="balances" active={tab === "balances"}>
          Balances
        </TabLink>
      </div>

      {tab === "gastos" && (
        <div className="flex flex-col gap-4">
          <AddExpenseForm roomId={roomId} members={members} />
          <ul className="flex flex-col gap-2">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{expense.description}</span>
                  <span>{expense.amount.toFixed(2)} €</span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>
                    {memberName(expense.paid_by)} · {expense.expense_date} ·{" "}
                    {expense.category}
                  </span>
                  <form action={deleteExpense.bind(null, roomId, expense.id)}>
                    <button type="submit" className="hover:text-red-600">
                      ✕
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          {expenses.length === 0 && (
            <p className="text-sm text-neutral-500">Aún no hay gastos.</p>
          )}
        </div>
      )}

      {tab === "miembros" && (
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
              >
                <div>
                  <div>{m.display_name}</div>
                  <div className="text-xs text-neutral-500">{m.phone}</div>
                </div>
                <span className="text-xs text-neutral-500">
                  {m.role === "admin" ? "Admin" : "Miembro"}
                  {m.is_ghost ? " · fantasma" : ""}
                </span>
              </li>
            ))}
          </ul>
          <AddMemberForm roomId={roomId} />
        </div>
      )}

      {tab === "balances" && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-2 font-medium">Balance neto</h2>
            <ul className="flex flex-col gap-1">
              {balances.map((b) => (
                <li
                  key={b.memberId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{memberName(b.memberId)}</span>
                  <span
                    className={
                      b.amount > 0
                        ? "text-green-600"
                        : b.amount < 0
                          ? "text-red-600"
                          : "text-neutral-500"
                    }
                  >
                    {b.amount > 0 ? "+" : ""}
                    {b.amount.toFixed(2)} €
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 font-medium">Deudas simplificadas</h2>
            <ul className="flex flex-col gap-2">
              {simplified.map((t, i) => (
                <SettlementRow
                  key={i}
                  roomId={roomId}
                  from={t.from}
                  to={t.to}
                  amount={t.amount}
                  fromName={memberName(t.from)}
                  toName={memberName(t.to)}
                />
              ))}
            </ul>
            {simplified.length === 0 && (
              <p className="text-sm text-neutral-500">Todo saldado. 🎉</p>
            )}
          </div>

          <details>
            <summary className="cursor-pointer text-sm text-neutral-500">
              Ver deuda detallada (gasto a gasto)
            </summary>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {detailed.map((t, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>
                    {memberName(t.from)} → {memberName(t.to)}
                  </span>
                  <span>{t.amount.toFixed(2)} €</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </main>
  );
}

function TabLink({
  roomId,
  tab,
  active,
  children,
}: {
  roomId: string;
  tab: Tab;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/gastos/${roomId}?tab=${tab}`}
      className={`rounded-full border px-3 py-1 ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
          : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
      }`}
    >
      {children}
    </Link>
  );
}

function SettlementRow({
  roomId,
  from,
  to,
  amount,
  fromName,
  toName,
}: {
  roomId: string;
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
}) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
      <span>
        {fromName} debe {amount.toFixed(2)} € a {toName}
      </span>
      <form action={recordSettlement}>
        <input type="hidden" name="room_id" value={roomId} />
        <input type="hidden" name="from_member_id" value={from} />
        <input type="hidden" name="to_member_id" value={to} />
        <input type="hidden" name="amount" value={amount} />
        <input type="hidden" name="method" value="efectivo" />
        <button
          type="submit"
          className="text-xs text-green-700 underline underline-offset-2 dark:text-green-400"
        >
          Marcar saldado
        </button>
      </form>
    </li>
  );
}
