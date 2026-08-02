export type ExpenseCategory =
  | "comida"
  | "gasolina"
  | "ocio"
  | "gourmet"
  | "restaurantes"
  | "gastos_fijos"
  | "otros";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "comida", label: "Comida" },
  { value: "gasolina", label: "Gasolina" },
  { value: "ocio", label: "Ocio" },
  { value: "gourmet", label: "Gourmet" },
  { value: "restaurantes", label: "Restaurantes" },
  { value: "gastos_fijos", label: "Gastos fijos" },
  { value: "otros", label: "Otros" },
];

export function expenseCategoryLabel(value: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
