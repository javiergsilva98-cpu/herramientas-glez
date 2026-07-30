export type Tool = {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  emoji: string;
  color: string;
  href: string;
  ready: boolean;
};

export const tools: Tool[] = [
  {
    slug: "lista-compra",
    name: "Lista de la compra",
    shortName: "Compra",
    description: "Lista compartida para no olvidar nada en el súper.",
    emoji: "🛒",
    color: "#16a34a",
    href: "/lista-compra",
    ready: true,
  },
  {
    slug: "tareas",
    name: "Lista de tareas",
    shortName: "Tareas",
    description: "Pendientes del día a día.",
    emoji: "✅",
    color: "#2563eb",
    href: "/tareas",
    ready: false,
  },
  {
    slug: "maleta",
    name: "Maleta",
    shortName: "Maleta",
    description: "Listas de equipaje para viajes y escapadas.",
    emoji: "🧳",
    color: "#ea580c",
    href: "/maleta",
    ready: false,
  },
  {
    slug: "huerto",
    name: "Tareas del huerto",
    shortName: "Huerto",
    description: "Riego, siembra y cuidados del huerto.",
    emoji: "🌱",
    color: "#15803d",
    href: "/huerto",
    ready: false,
  },
  {
    slug: "gastos",
    name: "Divisor de gastos",
    shortName: "Gastos",
    description: "Reparte gastos compartidos, estilo Settle Up.",
    emoji: "💶",
    color: "#7c3aed",
    href: "/gastos",
    ready: false,
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}
