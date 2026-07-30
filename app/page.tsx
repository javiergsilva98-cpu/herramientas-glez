import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HOME_COLOR, tools } from "@/lib/tools";
import { SignOutButton } from "@/components/sign-out-button";
import { ToolHeader } from "@/components/tool-header";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <ToolHeader color={HOME_COLOR}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Herramientas Glez</h1>
            {user?.email && (
              <p className="text-sm text-white/80">{user.email}</p>
            )}
          </div>
          <SignOutButton light />
        </div>
      </ToolHeader>

      <main className="mx-auto max-w-2xl p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.ready ? tool.href : "#"}
              aria-disabled={!tool.ready}
              className="flex flex-col gap-2 rounded-2xl border border-neutral-200 p-4 transition hover:border-neutral-400 aria-disabled:pointer-events-none aria-disabled:opacity-40 dark:border-neutral-800 dark:hover:border-neutral-600"
              style={{ borderTopColor: tool.color, borderTopWidth: 3 }}
            >
              <span className="text-3xl">{tool.emoji}</span>
              <span className="font-medium">{tool.name}</span>
              <span className="text-xs text-neutral-500">
                {tool.ready ? tool.description : "Próximamente"}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
