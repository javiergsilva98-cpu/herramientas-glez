"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { VehicleSilhouette } from "./vehicle-silhouette";
import type { Vehicle } from "@/lib/types/garaje";

export type PagerItem = {
  vehicle: Vehicle;
  alert: string | null;
  alertOverdue: boolean;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export function VehiclePager({ items }: { items: PagerItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="gj-pager flex snap-x snap-mandatory overflow-x-auto"
      >
        {items.map(({ vehicle: v, alert, alertOverdue, deleteAction }) => {
          const accent = v.vehicle_type === "moto" ? "var(--gj-moto)" : "var(--gj-coche)";
          return (
            <div key={v.id} className="w-full flex-shrink-0 snap-start px-1">
              <div
                className="gj-panel relative flex h-52 flex-col justify-end overflow-hidden rounded-2xl border p-5"
                style={{
                  backgroundImage: `radial-gradient(120% 90% at 30% 15%, color-mix(in srgb, ${accent} 22%, transparent) 0%, var(--gj-panel) 70%)`,
                }}
              >
                <div className="absolute right-4 top-4 z-10">
                  <form action={deleteAction}>
                    <button
                      type="submit"
                      aria-label="Eliminar vehículo"
                      className="gj-soft hover:opacity-70"
                    >
                      ✕
                    </button>
                  </form>
                </div>
                <div className="pointer-events-none absolute left-2 top-0 opacity-90">
                  <VehicleSilhouette type={v.vehicle_type} color={accent} />
                </div>
                <div className="relative">
                  <div className="text-xl font-extrabold uppercase tracking-wide">
                    {v.name}
                  </div>
                  <div className="gj-soft text-xs">
                    {[v.brand, v.model].filter(Boolean).join(" ")}
                  </div>
                  {alert && (
                    <div
                      className={`gj-mono mt-2 text-xs ${alertOverdue ? "gj-alert" : "gj-soft"}`}
                    >
                      {alert}
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/garaje/${v.id}`}
                className="gj-mono gj-amber mt-2 block text-center text-xs uppercase tracking-wide"
              >
                Ver ficha →
              </Link>
            </div>
          );
        })}
      </div>
      {items.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <span key={i} className={`gj-dot ${i === active ? "active" : ""}`} />
          ))}
        </div>
      )}
    </div>
  );
}
