import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { ToolHeader } from "@/components/tool-header";
import { getTool } from "@/lib/tools";
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

const TOOL_COLOR = getTool("jara")!.color;

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
    <>
      <ToolHeader color={TOOL_COLOR}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">🐾 Jara</h1>
          <ShareButton light path="/jara" title="Jara" />
        </div>
      </ToolHeader>

      <main className="mx-auto max-w-md p-6">
        <div className="mb-6">
          <h2 className="mb-2 font-medium">Próximos recordatorios</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No hay recordatorios programados.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
                >
                  <span>{item.label}</span>
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

        <div className="mb-6 flex gap-2 text-sm">
          <TabLink tab="salud" active={tab === "salud"}>
            Salud
          </TabLink>
          <TabLink tab="caza" active={tab === "caza"}>
            Caza
          </TabLink>
          <TabLink tab="peluqueria" active={tab === "peluqueria"}>
            Peluquería
          </TabLink>
        </div>

        {tab === "salud" && (
          <div className="flex flex-col gap-4">
            <HealthForm />
            <ul className="flex flex-col gap-2">
              {healthEvents.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {healthEventTypeLabel(e.event_type)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">
                        {e.event_date}
                      </span>
                      <form action={deleteHealthEvent.bind(null, e.id)}>
                        <button type="submit" className="hover:text-red-600">
                          ✕
                        </button>
                      </form>
                    </div>
                  </div>
                  {e.next_due_date && (
                    <div
                      className={
                        e.next_due_date < today
                          ? "text-xs font-medium text-red-600"
                          : "text-xs text-neutral-500"
                      }
                    >
                      Próxima: {e.next_due_date}
                    </div>
                  )}
                  {e.notes && (
                    <p className="mt-1 text-xs text-neutral-500">{e.notes}</p>
                  )}
                </li>
              ))}
            </ul>
            {healthEvents.length === 0 && (
              <p className="text-sm text-neutral-500">
                Aún no hay eventos de salud.
              </p>
            )}
          </div>
        )}

        {tab === "caza" && (
          <div className="flex flex-col gap-4">
            <HuntingForm />
            <ul className="flex flex-col gap-2">
              {huntingDays.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{d.event_date}</span>
                    <form action={deleteHuntingDay.bind(null, d.id)}>
                      <button type="submit" className="hover:text-red-600">
                        ✕
                      </button>
                    </form>
                  </div>
                  {d.notes && (
                    <p className="mt-1 text-xs text-neutral-500">{d.notes}</p>
                  )}
                </li>
              ))}
            </ul>
            {huntingDays.length === 0 && (
              <p className="text-sm text-neutral-500">
                Aún no hay jornadas de caza.
              </p>
            )}
          </div>
        )}

        {tab === "peluqueria" && (
          <div className="flex flex-col gap-4">
            <GroomingForm />
            <ul className="flex flex-col gap-2">
              {groomingReminders.map((g) => (
                <li
                  key={g.id}
                  className="rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{g.event_date}</span>
                    <form action={deleteGroomingReminder.bind(null, g.id)}>
                      <button type="submit" className="hover:text-red-600">
                        ✕
                      </button>
                    </form>
                  </div>
                  {g.next_due_date && (
                    <div
                      className={
                        g.next_due_date < today
                          ? "text-xs font-medium text-red-600"
                          : "text-xs text-neutral-500"
                      }
                    >
                      Próxima: {g.next_due_date}
                    </div>
                  )}
                  {g.notes && (
                    <p className="mt-1 text-xs text-neutral-500">{g.notes}</p>
                  )}
                </li>
              ))}
            </ul>
            {groomingReminders.length === 0 && (
              <p className="text-sm text-neutral-500">
                Aún no hay recordatorios de peluquería.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function TabLink({
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
