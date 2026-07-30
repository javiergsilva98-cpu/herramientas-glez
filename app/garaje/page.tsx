import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { ToolHeader } from "@/components/tool-header";
import { getTool } from "@/lib/tools";
import type { Vehicle } from "@/lib/types/garaje";
import { VehicleForm } from "./vehicle-form";
import { deleteVehicle } from "./actions";

const TOOL_COLOR = getTool("garaje")!.color;

type UpcomingItem = {
  date: string;
  label: string;
  vehicleId: string;
  vehicleName: string;
};

export default async function GarajePage() {
  const supabase = await createClient();

  const { data: vehiclesData } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: true });
  const vehicles = (vehiclesData ?? []) as Vehicle[];

  const { data: docsData } = await supabase
    .from("vehicle_documents")
    .select("document_type, expiry_date, vehicle_id, vehicles(name)")
    .not("expiry_date", "is", null)
    .order("expiry_date", { ascending: true });

  const { data: maintData } = await supabase
    .from("maintenance_records")
    .select("maintenance_type, next_due_date, vehicle_id, vehicles(name)")
    .not("next_due_date", "is", null)
    .order("next_due_date", { ascending: true });

  const docRows = (docsData ?? []) as unknown as {
    document_type: string;
    expiry_date: string;
    vehicle_id: string;
    vehicles: { name: string } | null;
  }[];
  const maintRows = (maintData ?? []) as unknown as {
    maintenance_type: string;
    next_due_date: string;
    vehicle_id: string;
    vehicles: { name: string } | null;
  }[];

  const upcoming: UpcomingItem[] = [
    ...docRows.map((d) => ({
      date: d.expiry_date,
      label: d.document_type,
      vehicleId: d.vehicle_id,
      vehicleName: d.vehicles?.name ?? "?",
    })),
    ...maintRows.map((m) => ({
      date: m.next_due_date,
      label: m.maintenance_type,
      vehicleId: m.vehicle_id,
      vehicleName: m.vehicles?.name ?? "?",
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <ToolHeader color={TOOL_COLOR}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">🔧 Garaje</h1>
          <ShareButton light path="/garaje" title="Garaje" />
        </div>
      </ToolHeader>

      <main className="mx-auto max-w-md p-6">
        <div className="mb-6">
          <h2 className="mb-2 font-medium">Próximos vencimientos</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No hay vencimientos programados.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
                >
                  <Link
                    href={`/garaje/${item.vehicleId}`}
                    className="hover:underline"
                  >
                    <span className="font-medium">{item.vehicleName}</span> ·{" "}
                    {item.label}
                  </Link>
                  <span
                    className={
                      item.date < today
                        ? "font-medium text-red-600"
                        : "text-neutral-500"
                    }
                  >
                    {item.date}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Vehículos</h2>
          <ul className="flex flex-col gap-2">
            {vehicles.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
              >
                <Link
                  href={`/garaje/${v.id}`}
                  className="flex flex-1 items-center justify-between hover:underline"
                >
                  <span>
                    {v.vehicle_type === "moto" ? "🏍️" : "🚗"} {v.name}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {[v.brand, v.model].filter(Boolean).join(" ")}
                  </span>
                </Link>
                <form action={deleteVehicle.bind(null, v.id)}>
                  <button
                    type="submit"
                    aria-label="Eliminar vehículo"
                    className="text-neutral-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>
          {vehicles.length === 0 && (
            <p className="text-sm text-neutral-500">
              Todavía no hay vehículos.
            </p>
          )}

          <VehicleForm />
        </div>
      </main>
    </>
  );
}
