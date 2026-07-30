import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { PhoneForm } from "./phone-form";
import { RoomForm } from "./room-form";

export default async function GastosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .single();

  const { data: memberRows } = await supabase
    .from("room_members")
    .select("room_id")
    .eq("user_id", user.id);

  const roomIds = (memberRows ?? []).map((row) => row.room_id);

  const { data: roomsData } =
    roomIds.length > 0
      ? await supabase
          .from("rooms")
          .select("id, name, room_type, currency")
          .in("id", roomIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const rooms = roomsData ?? [];

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="mb-6 flex items-center justify-end">
        <ShareButton path="/gastos" title="Divisor de gastos" />
      </div>

      <h1 className="mb-6 text-2xl font-semibold">💶 Divisor de gastos</h1>

      {!profile?.phone ? (
        <PhoneForm />
      ) : (
        <div className="flex flex-col gap-6">
          <ul className="flex flex-col gap-2">
            {rooms.map((room) => (
              <li key={room.id}>
                <Link
                  href={`/gastos/${room.id}`}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
                >
                  <span>{room.name}</span>
                  <span className="text-xs text-neutral-500">
                    {room.room_type}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {rooms.length === 0 && (
            <p className="text-sm text-neutral-500">
              Todavía no tienes ninguna sala. Crea la primera abajo.
            </p>
          )}

          <RoomForm />
        </div>
      )}
    </main>
  );
}
