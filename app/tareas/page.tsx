import { ComingSoon } from "@/components/coming-soon";
import { getTool } from "@/lib/tools";

export default function TareasPage() {
  return (
    <ComingSoon
      emoji="✅"
      name="Lista de tareas"
      path="/tareas"
      color={getTool("tareas")!.color}
    />
  );
}
