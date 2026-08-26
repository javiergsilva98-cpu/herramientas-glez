import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import type { GroomingReminder, HuntingDay, JaraHealthEvent } from "@/lib/types/jara";
import { healthEventTypeLabel } from "./constants";
import { HealthForm } from "./health-form";
import { HuntingForm } from "./hunting-form";
import { GroomingForm } from "./grooming-form";
import {
  deleteHealthEvent,
  deleteHuntingDay,
  deleteGroomingReminder,
} from "./actions";

type Tab = "salud" | "caza" | "peluqueria";

type UpcomingItem = {
  date: string;
  label: string;
};

export default async function JaraPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: tabParam } = await searchParams;
  const tab: Tab =
    tabParam === "caza" || tabParam === "peluqueria" ? tabParam : "salud";

  const supabase = await createClient();

  const { data: healthData } = await supabase
    .from("jara_health_events")
    .select("*")
    .order("event_date", { ascending: false });
  const healthEvents = (healthData ?? []) as JaraHealthEvent[];

  const { data: huntingData } = await supabase
    .from("hunting_days")
    .select("*")
    .order("event_date", { ascending: false });
  const huntingDays = (huntingData ?? []) as HuntingDay[];

  const { data: groomingData } = await supabase
    .from("grooming_reminders")
    .select("*")
    .order("event_date", { ascending: false });
  const groomingReminders = (groomingData ?? []) as GroomingReminder[];

  const today = new Date().toISOString().slice(0, 10);

  const upcoming: UpcomingItem[] = [
    ...healthEvents
      .filter((e) => e.next_due_date)
      .map((e) => ({
        date: e.next_due_date as string,
        label: healthEventTypeLabel(e.event_type),
      })),
    ...groomingReminders
      .filter((g) => g.next_due_date)
      .map((g) => ({ date: g.next_due_date as string, label: "Peluquería/baño" })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="jr flex min-h-dvh">
      <nav className="jr-ribbon flex w-11 flex-shrink-0 flex-col gap-1 pt-6">
        <RibbonTab tab="salud" active={tab === "salud"}>
          Salud
        </RibbonTab>
        <RibbonTab tab="caza" active={tab === "caza"}>
          Caza
        </RibbonTab>
        <RibbonTab tab="peluqueria" active={tab === "peluqueria"}>
          Aseo
        </RibbonTab>
      </nav>

      <div className="min-w-0 flex-1">
        <div className="jr-topo px-6 py-5">
          <svg viewBox="0 0 300 90" preserveAspectRatio="none">
            <path
              d="M0,72 C60,36 90,80 150,50 C210,18 250,63 300,40"
              stroke="var(--jr-accent)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M0,54 C60,18 90,63 150,32 C210,0 250,45 300,22"
              stroke="var(--jr-accent)"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          <div className="relative flex items-start justify-between">
            <div>
              <h1 className="jr-sans text-xl font-semibold">🐾 Jara</h1>
              <p className="jr-sans jr-soft text-xs">Bretón Español</p>
            </div>
            <div className="jr-sans">
              <ShareButton path="/jara" title="Jara" />
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-md p-6">
          <div className="jr-card corner mb-6 rounded px-4 py-3 text-sm">
            {upcoming.length === 0 ? (
              <span className="jr-soft">No hay recordatorios programados.</span>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {upcoming.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <span>
                      <span className="jr-paw mr-1.5">🐾</span>
                      {item.label}
                    </span>
                    <span
                      className={item.date < today ? "font-semibold" : "jr-soft"}
                      style={item.date < today ? { color: "var(--jr-accent)" } : undefined}
                    >
                      {item.date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {tab === "salud" && (
            <div className="flex flex-col gap-4">
              <HealthForm />
              <ul className="flex flex-col">
                {healthEvents.map((e) => (
                  <li key={e.id} className="jr-entry py-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span>
                        <span className="jr-paw mr-1.5">🐾</span>
                        <span className="font-medium">
                          {healthEventTypeLabel(e.event_type)}
                        </span>
                      </span>
                      <div className="jr-sans flex items-center gap-2">
                        <span className="jr-soft text-xs">{e.event_date}</span>
                        <form action={deleteHealthEvent.bind(null, e.id)}>
                          <button type="submit" className="hover:opacity-70">
                            ✕
                          </button>
                        </form>
                      </div>
                    </div>
                    {(e.place || e.price != null) && (
                      <div className="jr-soft mt-1 pl-6 text-xs">
                        {[e.place, e.price != null ? `${e.price.toFixed(2)} €` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    )}
                    {e.next_due_date && (
                      <div className="mt-1 pl-6 text-xs">
                        <span
                          className={e.next_due_date < today ? "font-semibold" : "jr-soft"}
                          style={
                            e.next_due_date < today
                              ? { color: "var(--jr-accent)" }
                              : undefined
                          }
                        >
                          Próxima: {e.next_due_date}
                        </span>
                      </div>
                    )}
                    {e.notes && <p className="jr-soft mt-1 pl-6 text-xs">{e.notes}</p>}
                  </li>
                ))}
              </ul>
              {healthEvents.length === 0 && (
                <p className="jr-soft text-sm">Aún no hay eventos de salud.</p>
              )}
            </div>
          )}

          {tab === "caza" && (
            <div className="flex flex-col gap-4">
              <HuntingForm />
              <ul className="flex flex-col">
                {huntingDays.map((d) => (
                  <li key={d.id} className="jr-entry py-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span>
                        <span className="jr-paw moss mr-1.5">🐾</span>
                        <span className="font-medium">{d.event_date}</span>
                      </span>
                      <form action={deleteHuntingDay.bind(null, d.id)}>
                        <button type="submit" className="hover:opacity-70">
                          ✕
                        </button>
                      </form>
                    </div>
                    {d.notes && <p className="jr-soft mt-1 pl-6 text-xs">{d.notes}</p>}
                  </li>
                ))}
              </ul>
              {huntingDays.length === 0 && (
                <p className="jr-soft text-sm">Aún no hay jornadas de caza.</p>
              )}
            </div>
          )}

          {tab === "peluqueria" && (
            <div className="flex flex-col gap-4">
              <GroomingForm />
              <ul className="flex flex-col">
                {groomingReminders.map((g) => (
                  <li key={g.id} className="jr-entry py-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span>
                        <span className="jr-paw mr-1.5">🐾</span>
                        <span className="font-medium">{g.event_date}</span>
                      </span>
                      <form action={deleteGroomingReminder.bind(null, g.id)}>
                        <button type="submit" className="hover:opacity-70">
                          ✕
                        </button>
                      </form>
                    </div>
                    {g.next_due_date && (
                      <div className="mt-1 pl-6 text-xs">
                        <span
                          className={g.next_due_date < today ? "font-semibold" : "jr-soft"}
                          style={
                            g.next_due_date < today
                              ? { color: "var(--jr-accent)" }
                              : undefined
                          }
                        >
                          Próxima: {g.next_due_date}
                        </span>
                      </div>
                    )}
                    {g.notes && <p className="jr-soft mt-1 pl-6 text-xs">{g.notes}</p>}
                  </li>
                ))}
              </ul>
              {groomingReminders.length === 0 && (
                <p className="jr-soft text-sm">
                  Aún no hay recordatorios de peluquería.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function RibbonTab({
  tab,
  active,
  children,
}: {
  tab: Tab;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/jara?tab=${tab}`}
      className={`jr-tab jr-sans py-3 text-[10px] ${active ? "active" : ""}`}
    >
      {children}
    </Link>
  );
}
