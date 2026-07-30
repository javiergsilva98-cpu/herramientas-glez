import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { getTool } from "@/lib/tools";
import type { MaintenanceRecord, Vehicle, VehicleDocument } from "@/lib/types/garaje";
import { documentTypeLabel } from "../constants";
import { VehicleSilhouette } from "../vehicle-silhouette";
import { AddMaintenanceButton } from "./add-maintenance-button";
import { AddDocumentButton } from "./add-document-button";
import { deleteMaintenance, deleteDocument } from "./actions";

const TOOL_COLOR = getTool("garaje")!.color;

type Tab = "resumen" | "mantenimientos" | "documentos";

export default async function VehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ vehicleId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { vehicleId } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab =
    tabParam === "mantenimientos" || tabParam === "documentos"
      ? tabParam
      : "resumen";

  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .single();

  if (!vehicle) notFound();
  const v = vehicle as Vehicle;
  const accent = v.vehicle_type === "moto" ? "var(--gj-moto)" : "var(--gj-coche)";

  const { data: maintData } = await supabase
    .from("maintenance_records")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("record_date", { ascending: false });
  const maintenanceRecords = (maintData ?? []) as MaintenanceRecord[];

  const { data: docsData } = await supabase
    .from("vehicle_documents")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("expiry_date", { ascending: true });
  const documents = (docsData ?? []) as VehicleDocument[];

  const today = new Date().toISOString().slice(0, 10);

  const totalSpent = maintenanceRecords.reduce(
    (sum, m) => sum + (m.price ?? 0),
    0,
  );

  const upcomingMaintenance = [...maintenanceRecords]
    .filter((m): m is MaintenanceRecord & { next_due_date: string } =>
      Boolean(m.next_due_date),
    )
    .sort((a, b) => a.next_due_date.localeCompare(b.next_due_date))[0];

  const upcomingDocument = [...documents]
    .filter((d): d is VehicleDocument & { expiry_date: string } =>
      Boolean(d.expiry_date),
    )
    .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date))[0];

  return (
    <div className="gj min-h-dvh">
      <div
        className="relative flex h-44 flex-col justify-end overflow-hidden px-6 pb-4"
        style={{
          backgroundImage: `radial-gradient(120% 100% at 30% 0%, color-mix(in srgb, ${accent} 20%, transparent) 0%, var(--gj-bg) 75%)`,
        }}
      >
        <Link
          href="/garaje"
          className="gj-soft absolute left-6 top-4 text-xs underline underline-offset-2 hover:opacity-80"
        >
          ← Garaje
        </Link>
        <div className="pointer-events-none absolute -right-4 top-6 opacity-80">
          <VehicleSilhouette type={v.vehicle_type} color={accent} />
        </div>
        <div className="relative flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-wide">{v.name}</h1>
            <p className="gj-soft text-xs">
              {[v.brand, v.model, v.year].filter(Boolean).join(" · ")}
              {v.plate ? ` · ${v.plate}` : ""}
            </p>
          </div>
          <ShareButton light path={`/garaje/${vehicleId}`} title={v.name} />
        </div>
      </div>

      <main className="mx-auto max-w-md p-6 pb-24">
        <div className="mb-6 flex gap-2 text-sm">
          <TabLink vehicleId={vehicleId} tab="resumen" active={tab === "resumen"}>
            Resumen
          </TabLink>
          <TabLink
            vehicleId={vehicleId}
            tab="mantenimientos"
            active={tab === "mantenimientos"}
          >
            Mantenimientos
          </TabLink>
          <TabLink
            vehicleId={vehicleId}
            tab="documentos"
            active={tab === "documentos"}
          >
            Documentos
          </TabLink>
        </div>

        {tab === "resumen" && (
          <div className="flex flex-col gap-6">
            <div className="flex gap-2.5">
              <Gauge value={`${totalSpent.toFixed(0)}€`} label="Gastado" />
              <Gauge value={String(maintenanceRecords.length)} label="Registros" />
            </div>

            <div>
              <div className="gj-soft mb-2 text-[11px] uppercase tracking-widest">
                Próximos avisos
              </div>
              <ul className="gj-panel flex flex-col divide-y rounded-xl border text-sm">
                {upcomingMaintenance && (
                  <li className="gj-hair flex items-center justify-between px-4 py-2.5">
                    <span>{upcomingMaintenance.maintenance_type}</span>
                    <span
                      className={`gj-mono text-xs ${upcomingMaintenance.next_due_date < today ? "gj-alert" : "gj-soft"}`}
                    >
                      {upcomingMaintenance.next_due_date}
                    </span>
                  </li>
                )}
                {upcomingDocument && (
                  <li className="gj-hair flex items-center justify-between px-4 py-2.5">
                    <span>{documentTypeLabel(upcomingDocument.document_type)}</span>
                    <span
                      className={`gj-mono text-xs ${upcomingDocument.expiry_date < today ? "gj-alert" : "gj-soft"}`}
                    >
                      {upcomingDocument.expiry_date}
                    </span>
                  </li>
                )}
                {!upcomingMaintenance && !upcomingDocument && (
                  <li className="gj-soft px-4 py-2.5 text-sm">
                    No hay avisos programados.
                  </li>
                )}
              </ul>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="gj-soft text-[11px] uppercase tracking-widest">
                  Último historial
                </div>
                {maintenanceRecords.length > 3 && (
                  <Link
                    href={`/garaje/${vehicleId}?tab=mantenimientos`}
                    className="gj-soft text-xs underline underline-offset-2"
                  >
                    Ver todos
                  </Link>
                )}
              </div>
              <ul className="gj-panel flex flex-col divide-y rounded-xl border text-sm">
                {maintenanceRecords.slice(0, 3).map((m) => (
                  <li key={m.id} className="gj-hair px-4 py-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span>{m.maintenance_type}</span>
                      {m.price != null && (
                        <span className="gj-mono gj-soft">{m.price.toFixed(2)}€</span>
                      )}
                    </div>
                    <div className="gj-mono gj-soft text-xs">
                      {m.record_date}
                      {m.km != null ? ` · ${m.km} km` : ""}
                    </div>
                  </li>
                ))}
                {maintenanceRecords.length === 0 && (
                  <li className="gj-soft px-4 py-2.5">Aún no hay mantenimientos.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {tab === "mantenimientos" && (
          <div className="flex flex-col gap-4">
            <ul className="gj-panel flex flex-col divide-y rounded-xl border text-sm">
              {maintenanceRecords.map((m) => (
                <li key={m.id} className="gj-hair px-4 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.maintenance_type}</span>
                    <div className="flex items-center gap-3">
                      {m.price != null && (
                        <span className="gj-mono gj-soft">{m.price.toFixed(2)}€</span>
                      )}
                      <form action={deleteMaintenance.bind(null, vehicleId, m.id)}>
                        <button type="submit" className="gj-soft hover:opacity-70">
                          ✕
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="gj-mono gj-soft text-xs">
                    {m.record_date}
                    {m.km != null ? ` · ${m.km} km` : ""} ·{" "}
                    {m.performed_by === "taller"
                      ? (m.workshop_name ?? "Taller")
                      : "Yo mismo"}
                  </div>
                  {(m.interval_km || m.next_due_date) && (
                    <div className="gj-mono mt-1 text-xs">
                      Próximo aviso:{" "}
                      <span className={m.next_due_date && m.next_due_date < today ? "gj-alert" : "gj-soft"}>
                        {m.next_due_date}
                      </span>
                      {m.next_due_date && m.interval_km ? " · " : ""}
                      {m.interval_km && (
                        <span className="gj-soft">
                          sobre los {(m.km ?? 0) + m.interval_km} km
                        </span>
                      )}
                    </div>
                  )}
                  {m.notes && <p className="gj-soft mt-1 text-xs">{m.notes}</p>}
                </li>
              ))}
              {maintenanceRecords.length === 0 && (
                <li className="gj-soft px-4 py-3">Aún no hay mantenimientos.</li>
              )}
            </ul>
          </div>
        )}

        {tab === "documentos" && (
          <div className="flex flex-col gap-4">
            <ul className="gj-panel flex flex-col divide-y rounded-xl border text-sm">
              {documents.map((d) => (
                <li key={d.id} className="gj-hair px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {documentTypeLabel(d.document_type)}
                    </span>
                    <div className="flex items-center gap-3">
                      {d.expiry_date && (
                        <span
                          className={`gj-mono text-xs ${d.expiry_date < today ? "gj-alert" : "gj-soft"}`}
                        >
                          {d.expiry_date}
                        </span>
                      )}
                      <form action={deleteDocument.bind(null, vehicleId, d.id)}>
                        <button type="submit" className="gj-soft hover:opacity-70">
                          ✕
                        </button>
                      </form>
                    </div>
                  </div>
                  {d.notes && <p className="gj-soft mt-1 text-xs">{d.notes}</p>}
                  {d.file_url && (
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="gj-amber mt-1 inline-block text-xs underline underline-offset-2"
                    >
                      📎 {d.file_name ?? "Ver archivo"}
                    </a>
                  )}
                </li>
              ))}
              {documents.length === 0 && (
                <li className="gj-soft px-4 py-3">Aún no hay documentos.</li>
              )}
            </ul>
          </div>
        )}
      </main>

      {tab === "mantenimientos" && (
        <AddMaintenanceButton vehicleId={vehicleId} color={TOOL_COLOR} />
      )}
      {tab === "documentos" && (
        <AddDocumentButton vehicleId={vehicleId} color={TOOL_COLOR} />
      )}
    </div>
  );
}

function TabLink({
  vehicleId,
  tab,
  active,
  children,
}: {
  vehicleId: string;
  tab: Tab;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/garaje/${vehicleId}?tab=${tab}`}
      className="gj-mono rounded-full border px-3 py-1 text-xs uppercase tracking-wide"
      style={
        active
          ? { borderColor: "var(--gj-amber)", backgroundColor: "var(--gj-amber)", color: "#1a1206" }
          : { borderColor: "var(--gj-hair)", color: "var(--gj-soft)" }
      }
    >
      {children}
    </Link>
  );
}

function Gauge({ value, label }: { value: string; label: string }) {
  return (
    <div className="gj-panel flex-1 rounded-xl border py-3 text-center">
      <div className="gj-mono gj-amber text-lg">{value}</div>
      <div className="gj-soft mt-0.5 text-[10px] uppercase tracking-widest">{label}</div>
    </div>
  );
}
