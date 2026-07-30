export function ToolHeader({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: color }} className="px-6 pb-8 pt-6 text-white">
      <div className="mx-auto max-w-md">{children}</div>
    </div>
  );
}
