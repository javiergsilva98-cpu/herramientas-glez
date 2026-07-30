import type { QuantityUnit, StoreChain, StoreType } from "@/lib/types/shopping";

export const STORE_TYPES: { value: StoreType; label: string }[] = [
  { value: "supermercado", label: "Supermercado" },
  { value: "vivero", label: "Vivero" },
  { value: "leroy_merlin", label: "Leroy Merlin" },
  { value: "ikea", label: "Ikea" },
  { value: "decathlon", label: "Decathlon" },
  { value: "carniceria_canencia", label: "Carnicería Canencia" },
];

export const STORE_CHAINS: { value: StoreChain; label: string }[] = [
  { value: "mercadona", label: "Mercadona" },
  { value: "carrefour", label: "Carrefour" },
  { value: "lidl", label: "Lidl" },
  { value: "ahorramas", label: "Ahorramás" },
];

export const QUANTITY_UNITS: { value: QuantityUnit; label: string }[] = [
  { value: "unidades", label: "ud." },
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
];

export function storeTypeLabel(value: StoreType | null): string | null {
  return STORE_TYPES.find((t) => t.value === value)?.label ?? null;
}

export function storeChainLabel(value: StoreChain | null): string | null {
  return STORE_CHAINS.find((c) => c.value === value)?.label ?? null;
}
