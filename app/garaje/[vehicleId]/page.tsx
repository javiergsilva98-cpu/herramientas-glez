import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { ToolHeader } from "@/components/tool-header";
import { getTool } from "@/lib/tools";
import type { MaintenanceRecord, Vehicle, VehicleDocument } from "@/lib/types/garaje";
import { documentTypeLabel } from "../constants";
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
    <>
      <ToolHeader color={TOOL_COLOR}>
        <Link
          href="/garaje"
          className="mb-2 inline-block text-sm text-white/80 underline underline-offset-2 hover:text-white"
        >
          ← Garaje
        </Link>
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
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Gastado en mantenimiento"
                value={`${totalSpent.toFixed(2)} €`}
              />
              <StatCard
                label="Mantenimientos registrados"
                value={String(maintenanceRecords.length)}
              />
            </div>

            <div>
              <h2 className="mb-2 font-medium">Próximos avisos</h2>
              <ul className="flex flex-col gap-2">
                {upcomingMaintenance && (
                  <li className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
                    <span>{upcomingMaintenance.maintenance_type}</span>
                    <span
                      className={
                        upcomingMaintenance.next_due_date < today
                          ? "font-medium text-red-600"
                          : "text-neutral-500"
                      }
                    >
                      {upcomingMaintenance.next_due_date}
                    </span>
                  </li>
                )}
                {upcomingDocument && (
                  <li className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
                    <span>{documentTypeLabel(upcomingDocument.document_type)}</span>
                    <span
                      className={
                        upcomingDocument.expiry_date < today
                          ? "font-medium text-red-600"
                          : "text-neutral-500"
                      }
                    >
                      {upcomingDocument.expiry_date}
                    </span>
                  </li>
                )}
                {!upcomingMaintenance && !upcomingDocument && (
                  <p className="text-sm text-neutral-500">
                    No hay avisos programados.
                  </p>
                )}
              </ul>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium">Últimos mantenimientos</h2>
                {maintenanceRecords.length > 3 && (
                  <Link
                    href={`/garaje/${vehicleId}?tab=mantenimientos`}
                    className="text-sm text-neutral-500 underline underline-offset-2"
                  >
                    Ver todos
                  </Link>
                )}
              </div>
              <ul className="flex flex-col gap-2">
                {maintenanceRecords.slice(0, 3).map((m) => (
                  <li
                    key={m.id}
                    className="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{m.maintenance_type}</span>
                      {m.price != null && <span>{m.price.toFixed(2)} €</span>}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {m.record_date}
                      {m.km != null ? ` · ${m.km} km` : ""}
                    </div>
                  </li>
                ))}
              </ul>
              {maintenanceRecords.length === 0 && (
                <p className="text-sm text-neutral-500">
                  Aún no hay mantenimientos.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "mantenimientos" && (
          <div className="flex flex-col gap-4">
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
                  {d.file_url && (
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs underline underline-offset-2 text-neutral-600 dark:text-neutral-400"
                    >
                      📎 {d.file_name ?? "Ver archivo"}
                    </a>
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

      {tab === "mantenimientos" && (
        <AddMaintenanceButton vehicleId={vehicleId} color={TOOL_COLOR} />
      )}
      {tab === "documentos" && (
        <AddDocumentButton vehicleId={vehicleId} color={TOOL_COLOR} />
      )}
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 px-3 py-3 text-center dark:border-neutral-800">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}
