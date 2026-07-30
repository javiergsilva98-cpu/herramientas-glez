export function VehicleSilhouette({
  type,
  color,
}: {
  type: "moto" | "coche";
  color: string;
}) {
  if (type === "moto") {
    return (
      <svg width="240" height="140" viewBox="0 0 240 140" fill="none">
        <circle cx="52" cy="108" r="24" stroke={color} strokeWidth="2.5" />
        <circle cx="180" cy="108" r="24" stroke={color} strokeWidth="2.5" />
        <path
          d="M52 108 L100 66 L138 66 L180 108"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
        />
        <path d="M100 66 L90 42 L120 42" stroke={color} strokeWidth="2.5" fill="none" />
        <line x1="138" y1="66" x2="138" y2="88" stroke={color} strokeWidth="2.5" />
      </svg>
    );
  }

  return (
    <svg width="240" height="140" viewBox="0 0 240 140" fill="none">
      <circle cx="68" cy="110" r="17" stroke={color} strokeWidth="2.5" />
      <circle cx="172" cy="110" r="17" stroke={color} strokeWidth="2.5" />
      <path
        d="M36 110 L50 80 L92 61 L152 61 L190 80 L204 110 Z"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
      />
      <line x1="36" y1="110" x2="204" y2="110" stroke={color} strokeWidth="2.5" />
    </svg>
  );
}
