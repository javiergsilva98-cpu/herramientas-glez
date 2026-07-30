import { ComingSoon } from "@/components/coming-soon";
import { getTool } from "@/lib/tools";

export default function MaletaPage() {
  return (
    <ComingSoon
      emoji="🧳"
      name="Maleta"
      path="/maleta"
      color={getTool("maleta")!.color}
    />
  );
}
