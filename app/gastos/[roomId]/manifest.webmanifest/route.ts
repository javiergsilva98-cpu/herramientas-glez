import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const supabase = await createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("name")
    .eq("id", roomId)
    .single();

  const name = room?.name ?? "Divisor de gastos";

  const manifest = {
    name,
    short_name: name.slice(0, 12),
    start_url: `/gastos/${roomId}`,
    scope: `/gastos/${roomId}`,
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0b8f91",
    icons: [
      {
        src: "/icons/gastos/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/gastos/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
