import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { ToolHeader } from "@/components/tool-header";
import { getTool } from "@/lib/tools";
import type { MaintenanceRecord, Vehicle, VehicleDocument } from "@/lib/types/garaje";
import { documentTypeLabel } from "../constants";
import { MaintenanceForm } from "./maintenance-form";
import { DocumentForm } from "./document-form";
import { deleteMaintenance, deleteDocument } from "./actions";

const TOOL_COLOR = getTool("garaje")!.color;

type Tab = "mantenimientos" | "documentos";

export default async function VehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ vehicleId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { vehicleId } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab = tabParam === "documentos" ? "documentos" : "mantenimientos";

  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .single();

  if (!vehicle) notFound();
  const v = vehicle as Vehicle;

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

  return (
    <>
      <ToolHeader color={TOOL_COLOR}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {v.vehicle_type === "moto" ? "🏍️" : "🚗"} {v.name}
            </h1>
            <p className="text-sm text-white/80">
              {[v.brand, v.model, v.year].filter(Boolean).join(" · ")}
              {v.plate ? ` · ${v.plate}` : ""}
            </p>
          </div>
          <ShareButton light path={`/garaje/${vehicleId}`} title={v.name} />
        </div>
      </ToolHeader>

      <main className="mx-auto max-w-md p-6">
        <div className="mb-6 flex gap-2 text-sm">
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

        {tab === "mantenimientos" && (
          <div className="flex flex-col gap-4">
            <MaintenanceForm vehicleId={vehicleId} />
            <ul className="flex flex-col gap-2">
              {maintenanceRecords.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.maintenance_type}</span>
                    <div className="flex items-center gap-2">
                      {m.price != null && <span>{m.price.toFixed(2)} €</span>}
                      <form action={deleteMaintenance.bind(null, vehicleId, m.id)}>
                        <button type="submit" className="hover:text-red-600">
                          ✕
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">
                    {m.record_date}
                    {m.km != null ? ` · ${m.km} km` : ""} ·{" "}
                    {m.performed_by === "taller"
                      ? (m.workshop_name ?? "Taller")
                      : "Yo mismo"}
                  </div>
                  {(m.interval_km || m.next_due_date) && (
                    <div className="mt-1 text-xs text-neutral-500">
                      Próximo aviso:{" "}
                      {m.next_due_date && (
                        <span
                          className={
                            m.next_due_date < today
                              ? "font-medium text-red-600"
                              : ""
                          }
                        >
                          {m.next_due_date}
                        </span>
                      )}
                      {m.next_due_date && m.interval_km ? " · " : ""}
                      {m.interval_km &&
                        `sobre los ${(m.km ?? 0) + m.interval_km} km`}
                    </div>
                  )}
                  {m.notes && (
                    <p className="mt-1 text-xs text-neutral-500">{m.notes}</p>
                  )}
                </li>
              ))}
            </ul>
            {maintenanceRecords.length === 0 && (
              <p className="text-sm text-neutral-500">
                Aún no hay mantenimientos.
              </p>
            )}
          </div>
        )}

        {tab === "documentos" && (
          <div className="flex flex-col gap-4">
            <DocumentForm vehicleId={vehicleId} />
            <ul className="flex flex-col gap-2">
              {documents.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {documentTypeLabel(d.document_type)}
                    </span>
                    <div className="flex items-center gap-2">
                      {d.expiry_date && (
                        <span
                          className={
                            d.expiry_date < today
                              ? "text-sm font-medium text-red-600"
                              : "text-sm text-neutral-500"
                          }
                        >
                          {d.expiry_date}
                        </span>
                      )}
                      <form action={deleteDocument.bind(null, vehicleId, d.id)}>
                        <button type="submit" className="hover:text-red-600">
                          ✕
                        </button>
                      </form>
                    </div>
                  </div>
                  {d.notes && (
                    <p className="mt-1 text-xs text-neutral-500">{d.notes}</p>
                  )}
                </li>
              ))}
            </ul>
            {documents.length === 0 && (
              <p className="text-sm text-neutral-500">
                Aún no hay documentos.
              </p>
            )}
          </div>
        )}
      </main>
    </>
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
      className={`rounded-full border px-3 py-1 ${
        active
          ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
          : "border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
      }`}
    >
      {children}
    </Link>
  );
}
