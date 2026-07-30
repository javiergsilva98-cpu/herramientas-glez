import type { DocumentType } from "@/lib/types/garaje";

export const MAINTENANCE_TYPE_SUGGESTIONS = [
  "Cambio de aceite",
  "Cadena",
  "Neumáticos",
  "Filtros",
  "ITV",
  "Revisión general",
];

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "seguro", label: "Seguro" },
  { value: "itv", label: "ITV" },
  { value: "permiso_circulacion", label: "Permiso de circulación" },
  { value: "otro", label: "Otro" },
];

export function documentTypeLabel(value: DocumentType): string {
  return DOCUMENT_TYPES.find((d) => d.value === value)?.label ?? value;
}
