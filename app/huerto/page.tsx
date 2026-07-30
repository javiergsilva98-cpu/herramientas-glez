import { ComingSoon } from "@/components/coming-soon";
import { getTool } from "@/lib/tools";

export default function HuertoPage() {
  return (
    <ComingSoon
      emoji="🌱"
      name="Tareas del huerto"
      path="/huerto"
      color={getTool("huerto")!.color}
    />
  );
}
