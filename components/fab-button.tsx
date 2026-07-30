"use client";

export function FabButton({
  color,
  label,
  onClick,
}: {
  color: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ backgroundColor: color }}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-3xl leading-none text-white shadow-lg"
    >
      +
    </button>
  );
}
