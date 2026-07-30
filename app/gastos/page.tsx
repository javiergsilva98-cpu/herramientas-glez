import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShareButton } from "@/components/share-button";
import { PhoneForm } from "./phone-form";
import { RoomForm } from "./room-form";
import { deleteRoom } from "./actions";
import { ToolHeader } from "@/components/tool-header";
import { getTool } from "@/lib/tools";

const TOOL_COLOR = getTool("gastos")!.color;

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
    .select("phone, can_create_rooms")
    .eq("id", user.id)
    .single();

  const { data: memberRows } = await supabase
    .from("room_members")
    .select("room_id, role")
    .eq("user_id", user.id);

  const roleByRoomId = new Map(
    (memberRows ?? []).map((row) => [row.room_id, row.role]),
  );
  const roomIds = [...roleByRoomId.keys()];

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
    <>
      <ToolHeader color={TOOL_COLOR}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">💶 Divisor de gastos</h1>
          <ShareButton light path="/gastos" title="Divisor de gastos" />
        </div>
      </ToolHeader>

      <main className="mx-auto max-w-md p-6">
      {!profile?.phone ? (
        <PhoneForm />
      ) : (
        <div className="flex flex-col gap-6">
          <ul className="flex flex-col gap-2">
            {rooms.map((room) => (
              <li
                key={room.id}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800"
              >
                <Link
                  href={`/gastos/${room.id}`}
                  className="flex flex-1 items-center justify-between hover:underline"
                >
                  <span>{room.name}</span>
                  <span className="text-xs text-neutral-500">
                    {room.room_type}
                  </span>
                </Link>
                {roleByRoomId.get(room.id) === "admin" && (
                  <form action={deleteRoom.bind(null, room.id)}>
                    <button
                      type="submit"
                      aria-label="Eliminar sala"
                      className="text-neutral-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>

          {rooms.length === 0 && (
            <p className="text-sm text-neutral-500">
              Todavía no tienes ninguna sala.
            </p>
          )}

          {profile.can_create_rooms ? (
            <RoomForm />
          ) : (
            <p className="text-sm text-neutral-500">
              Solo el administrador puede crear salas nuevas. Pide que te
              invite con un enlace a una sala existente.
            </p>
          )}
        </div>
      )}
      </main>
    </>
  );
}
