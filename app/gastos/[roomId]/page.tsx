import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ToolHeader } from "@/components/tool-header";
import { getTool } from "@/lib/tools";
import type { Expense, ExpenseSplit, RoomMember, Settlement } from "@/lib/types/gastos";
import { computeBalances, detailedDebts, simplifyDebts } from "@/lib/gastos/balances";
import { AddMemberForm } from "./add-member-form";
import { AddExpenseForm } from "./add-expense-form";
import { deleteExpense, recordSettlement } from "./actions";

type Tab = "resumen" | "gastos" | "miembros";

const GASTOS_COLOR = getTool("gastos")!.color;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomId: string }>;
}): Promise<Metadata> {
  const { roomId } = await params;
  const supabase = await createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("name")
    .eq("id", roomId)
    .single();

  const name = room?.name ?? "Divisor de gastos";

  return {
    title: name,
    manifest: `/gastos/${roomId}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      title: name,
      statusBarStyle: "default",
    },
    icons: {
      apple: "/icons/gastos/icon-180.png",
      icon: "/icons/gastos/icon-192.png",
    },
  };
}

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
    tabParam === "gastos" || tabParam === "miembros" ? tabParam : "resumen";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const myMember = members.find((m) => m.user_id === user?.id);
  const myBalance = myMember
    ? (balances.find((b) => b.memberId === myMember.id)?.amount ?? 0)
    : 0;
  const isSettled = Math.abs(myBalance) < 0.01;

  return (
    <>
      <ToolHeader color={GASTOS_COLOR}>
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/gastos"
            className="text-sm text-white/90 underline underline-offset-2 hover:text-white"
          >
            ← Salas
          </Link>
          <div className="flex items-center gap-3">
            <ShareButton
              light
              label="Guardar"
              path={`/gastos/${roomId}`}
              title={room.name}
              text={`Guarda "${room.name}" en tu pantalla de inicio para entrar directo.`}
            />
            <ShareButton
              light
              label="Invitar"
              path={`/gastos/${roomId}/unirse`}
              title={`Únete a "${room.name}"`}
              text={`Te invito a la sala de gastos "${room.name}" en Herramientas Glez.`}
            />
          </div>
        </div>

        <h1 className="mb-6 text-2xl font-semibold">{room.name}</h1>

        <div className="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-full bg-black/25 text-center">
          {isSettled ? (
            <>
              <span className="text-4xl">✓</span>
              <span className="mt-1 text-sm text-white/80">Sin deudas</span>
            </>
          ) : (
            <>
              <span className="text-3xl font-semibold">
                {myBalance > 0 ? "+" : ""}
                {myBalance.toFixed(2)} €
              </span>
              <span className="mt-1 text-sm text-white/80">
                {myBalance > 0 ? "te deben" : "debes"}
              </span>
            </>
          )}
        </div>
      </ToolHeader>

      <main className="mx-auto max-w-md p-6">
        <div className="mb-6 flex gap-2 text-sm">
          <TabLink roomId={roomId} tab="resumen" active={tab === "resumen"}>
            Resumen
          </TabLink>
          <TabLink roomId={roomId} tab="gastos" active={tab === "gastos"}>
            Gastos
          </TabLink>
          <TabLink roomId={roomId} tab="miembros" active={tab === "miembros"}>
            Miembros
          </TabLink>
        </div>

        {tab === "resumen" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="mb-2 font-medium">Deudas pendientes</h2>
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

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium">Últimos gastos</h2>
                {expenses.length > 5 && (
                  <Link
                    href={`/gastos/${roomId}?tab=gastos`}
                    className="text-sm text-neutral-500 underline underline-offset-2"
                  >
                    Ver todos
                  </Link>
                )}
              </div>
              <ul className="flex flex-col gap-2">
                {expenses.slice(0, 5).map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    paidByName={memberName(expense.paid_by)}
                  />
                ))}
              </ul>
              {expenses.length === 0 && (
                <p className="text-sm text-neutral-500">Aún no hay gastos.</p>
              )}
            </div>

            <details>
              <summary className="cursor-pointer text-sm text-neutral-500">
                Ver balance de cada miembro
              </summary>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {balances.map((b) => (
                  <li
                    key={b.memberId}
                    className="flex items-center justify-between"
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
            </details>

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

        {tab === "gastos" && (
          <div className="flex flex-col gap-4">
            <AddExpenseForm roomId={roomId} members={members} />
            <ul className="flex flex-col gap-2">
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  paidByName={memberName(expense.paid_by)}
                  onDelete={deleteExpense.bind(null, roomId, expense.id)}
                />
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
                    {m.is_ghost && (
                      <CopyLinkButton
                        path={`/gastos/${roomId}/unirse?miembro=${m.id}`}
                        label="Copiar enlace de invitación"
                      />
                    )}
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
      </main>
    </>
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

function ExpenseRow({
  expense,
  paidByName,
  onDelete,
}: {
  expense: Expense;
  paidByName: string;
  onDelete?: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <li className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <span className="font-medium">{expense.description}</span>
        <span>{expense.amount.toFixed(2)} €</span>
      </div>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          {paidByName} · {expense.expense_date} · {expense.category}
        </span>
        {onDelete && (
          <form action={onDelete}>
            <button type="submit" className="hover:text-red-600">
              ✕
            </button>
          </form>
        )}
      </div>
    </li>
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
