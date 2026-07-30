import type { HealthEventType } from "@/lib/types/jara";

export const HEALTH_EVENT_TYPES: { value: HealthEventType; label: string }[] = [
  { value: "vacuna", label: "Vacuna" },
  { value: "desparasitacion", label: "Desparasitación" },
  { value: "visita_veterinario", label: "Visita al veterinario" },
  { value: "incidencia", label: "Incidencia" },
];

export function healthEventTypeLabel(value: HealthEventType): string {
  return HEALTH_EVENT_TYPES.find((t) => t.value === value)?.label ?? value;
}
