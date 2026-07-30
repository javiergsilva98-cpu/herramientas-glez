import type { Expense, ExpenseSplit, Settlement } from "@/lib/types/gastos";

export type MemberBalance = {
  memberId: string;
  amount: number;
};

export type DebtTransaction = {
  from: string;
  to: string;
  amount: number;
};

export function computeBalances(
  memberIds: string[],
  expenses: Expense[],
  splits: ExpenseSplit[],
  settlements: Settlement[],
): MemberBalance[] {
  const balances = new Map<string, number>(memberIds.map((id) => [id, 0]));

  for (const expense of expenses) {
    balances.set(
      expense.paid_by,
      (balances.get(expense.paid_by) ?? 0) + Number(expense.amount),
    );
  }

  for (const split of splits) {
    balances.set(
      split.member_id,
      (balances.get(split.member_id) ?? 0) - Number(split.amount),
    );
  }

  for (const settlement of settlements) {
    balances.set(
      settlement.to_member_id,
      (balances.get(settlement.to_member_id) ?? 0) + Number(settlement.amount),
    );
    balances.set(
      settlement.from_member_id,
      (balances.get(settlement.from_member_id) ?? 0) - Number(settlement.amount),
    );
  }

  return memberIds.map((memberId) => ({
    memberId,
    amount: Math.round((balances.get(memberId) ?? 0) * 100) / 100,
  }));
}

/** Minimiza el número de transacciones necesarias para saldar todas las deudas. */
export function simplifyDebts(balances: MemberBalance[]): DebtTransaction[] {
  const creditors = balances
    .filter((b) => b.amount > 0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.amount - a.amount);
  const debtors = balances
    .filter((b) => b.amount < -0.01)
    .map((b) => ({ memberId: b.memberId, amount: -b.amount }))
    .sort((a, b) => b.amount - a.amount);

  const transactions: DebtTransaction[] = [];

  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.01) {
      transactions.push({
        from: debtor.memberId,
        to: creditor.memberId,
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}

/** Deuda detallada: quién debe qué a quién, gasto a gasto (sin simplificar). */
export function detailedDebts(
  expenses: Expense[],
  splits: ExpenseSplit[],
): DebtTransaction[] {
  const splitsByExpense = new Map<string, ExpenseSplit[]>();
  for (const split of splits) {
    const list = splitsByExpense.get(split.expense_id) ?? [];
    list.push(split);
    splitsByExpense.set(split.expense_id, list);
  }

  const transactions: DebtTransaction[] = [];
  for (const expense of expenses) {
    const expenseSplits = splitsByExpense.get(expense.id) ?? [];
    for (const split of expenseSplits) {
      if (split.member_id === expense.paid_by) continue;
      if (split.amount <= 0.01) continue;
      transactions.push({
        from: split.member_id,
        to: expense.paid_by,
        amount: Math.round(split.amount * 100) / 100,
      });
    }
  }
  return transactions;
}
