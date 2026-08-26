export type HealthEventType =
  | "vacuna"
  | "desparasitacion"
  | "visita_veterinario"
  | "incidencia";

export type JaraHealthEvent = {
  id: string;
  event_type: HealthEventType;
  event_date: string;
  next_due_date: string | null;
  price: number | null;
  place: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type HuntingDay = {
  id: string;
  event_date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type GroomingReminder = {
  id: string;
  event_date: string;
  next_due_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};
