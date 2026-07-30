import { ShareButton } from "./share-button";
import { ToolHeader } from "./tool-header";

export function ComingSoon({
  emoji,
  name,
  path,
  color,
}: {
  emoji: string;
  name: string;
  path: string;
  color: string;
}) {
  return (
    <>
      <ToolHeader color={color}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {emoji} {name}
          </h1>
          <ShareButton light path={path} title={name} />
        </div>
      </ToolHeader>

      <main className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-neutral-500">Todavía no está lista. Próximamente.</p>
      </main>
    </>
  );
}
