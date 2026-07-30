import { createClient } from "@/lib/supabase/server";
import { PhoneForm } from "../../phone-form";
import { joinRoom } from "../actions";

export default async function JoinRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { roomId } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6 text-center">
      <h1 className="text-2xl font-semibold">
        💶 Te han invitado a una sala de gastos
      </h1>

      {!profile?.phone ? (
        <div className="flex flex-col gap-3 text-left">
          <PhoneForm />
          <p className="text-sm text-neutral-500">
            Cuando lo hayas guardado, vuelve a abrir este mismo enlace de
            invitación para unirte.
          </p>
        </div>
      ) : (
        <form action={joinRoom.bind(null, roomId)}>
          <button
            type="submit"
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
          >
            Unirme a la sala
          </button>
        </form>
      )}

      {error && (
        <p className="text-sm text-red-600">
          No se ha podido completar: {error}
        </p>
      )}
    </main>
  );
}
