import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { getTool } from "@/lib/tools";
import type { Vehicle } from "@/lib/types/garaje";
import { AddVehicleButton } from "./add-vehicle-button";
import { VehiclePager, type PagerItem } from "./vehicle-pager";
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

  const pagerItems: PagerItem[] = vehicles.map((v) => {
    const nearest = upcoming.filter((u) => u.vehicleId === v.id)[0];
    return {
      vehicle: v,
      alert: nearest ? `${nearest.label} · ${nearest.date}` : null,
      alertOverdue: nearest ? nearest.date < today : false,
      deleteAction: deleteVehicle.bind(null, v.id),
    };
  });

  return (
    <div className="gj min-h-dvh">
      <div className="mx-auto max-w-md px-6 pb-4 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">🔧 Garaje</h1>
          <ShareButton light path="/garaje" title="Garaje" />
        </div>
      </div>

      <main className="mx-auto max-w-md p-6 pb-24 pt-0">
        <div className="mb-6">
          <div className="gj-soft mb-2 text-[11px] uppercase tracking-widest">
            Próximos avisos
          </div>
          {upcoming.length === 0 ? (
            <p className="gj-soft text-sm">No hay vencimientos programados.</p>
          ) : (
            <ul className="gj-panel flex flex-col divide-y rounded-xl border text-sm" style={{ borderColor: "var(--gj-hair)" }}>
              {upcoming.map((item, i) => (
                <li key={i} className="gj-hair flex items-center justify-between px-4 py-2.5">
                  <Link href={`/garaje/${item.vehicleId}`} className="hover:underline">
                    <span className="font-medium">{item.vehicleName}</span>{" "}
                    <span className="gj-soft">· {item.label}</span>
                  </Link>
                  <span className={`gj-mono text-xs ${item.date < today ? "gj-alert" : "gj-soft"}`}>
                    {item.date}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="gj-soft mb-2 text-[11px] uppercase tracking-widest">Vehículos</div>
        {pagerItems.length > 0 ? (
          <VehiclePager items={pagerItems} />
        ) : (
          <p className="gj-soft text-sm">Todavía no hay vehículos.</p>
        )}
      </main>

      <AddVehicleButton color={TOOL_COLOR} />
    </div>
  );
}
