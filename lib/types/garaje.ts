export type VehicleType = "moto" | "coche";

export type Vehicle = {
  id: string;
  name: string;
  vehicle_type: VehicleType;
  brand: string | null;
  model: string | null;
  year: number | null;
  plate: string | null;
  created_by: string | null;
  created_at: string;
};

export type PerformedBy = "taller" | "yo_mismo";

export type MaintenanceRecord = {
  id: string;
  vehicle_id: string;
  record_date: string;
  km: number | null;
  maintenance_type: string;
  performed_by: PerformedBy;
  workshop_name: string | null;
  price: number | null;
  interval_km: number | null;
  next_due_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type DocumentType = "seguro" | "itv" | "permiso_circulacion" | "otro";

export type VehicleDocument = {
  id: string;
  vehicle_id: string;
  document_type: DocumentType;
  expiry_date: string | null;
  notes: string | null;
  file_url: string | null;
  file_name: string | null;
  created_by: string | null;
  created_at: string;
};
