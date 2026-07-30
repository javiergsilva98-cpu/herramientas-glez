import type { SplitType } from "@/lib/types/gastos";

export type SplitInput = {
  memberId: string;
  /** Para 'exact': importe en euros. Para 'percentage': %. Para 'shares': nº de partes. Ignorado en 'equal'. */
  value: number;
};

export type SplitResult = {
  memberId: string;
  amount: number;
  shareValue: number | null;
};

/**
 * Calcula el importe final (en céntimos exactos) que corresponde a cada
 * miembro, ajustando el redondeo para que la suma cuadre siempre con el
 * importe total del gasto.
 */
export function computeSplitAmounts(
  splitType: SplitType,
  totalAmount: number,
  entries: SplitInput[],
): SplitResult[] {
  const totalCents = Math.round(totalAmount * 100);

  if (entries.length === 0) return [];

  if (splitType === "exact") {
    return entries.map((e) => ({
      memberId: e.memberId,
      amount: Math.round(e.value * 100) / 100,
      shareValue: null,
    }));
  }

  let rawCents: number[];
  let shareValues: (number | null)[];

  if (splitType === "equal") {
    const base = Math.floor(totalCents / entries.length);
    rawCents = entries.map(() => base);
    shareValues = entries.map(() => null);
  } else if (splitType === "percentage") {
    rawCents = entries.map((e) => Math.round((totalCents * e.value) / 100));
    shareValues = entries.map((e) => e.value);
  } else {
    const totalShares = entries.reduce((sum, e) => sum + e.value, 0) || 1;
    rawCents = entries.map((e) =>
      Math.round((totalCents * e.value) / totalShares),
    );
    shareValues = entries.map((e) => e.value);
  }

  const diff = totalCents - rawCents.reduce((a, b) => a + b, 0);
  if (rawCents.length > 0) {
    rawCents[rawCents.length - 1] += diff;
  }

  return entries.map((e, i) => ({
    memberId: e.memberId,
    amount: rawCents[i] / 100,
    shareValue: shareValues[i],
  }));
}
