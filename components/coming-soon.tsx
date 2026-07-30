import Link from "next/link";

export function ComingSoon({
  emoji,
  name,
}: {
  emoji: string;
  name: string;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-5xl">{emoji}</span>
      <h1 className="text-2xl font-semibold">{name}</h1>
      <p className="text-neutral-500">Todavía no está lista. Próximamente.</p>
      <Link href="/" className="text-sm underline underline-offset-2">
        ← Volver al inicio
      </Link>
    </main>
  );
}
