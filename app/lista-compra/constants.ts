import type {
  ProductCategory,
  QuantityUnit,
  StoreChain,
  StoreType,
} from "@/lib/types/shopping";

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

// Orden pensado como un recorrido típico de supermercado.
export const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "fruteria", label: "Frutería" },
  { value: "verduleria", label: "Verdulería" },
  { value: "panaderia", label: "Panadería" },
  { value: "carniceria", label: "Carnicería" },
  { value: "pescaderia", label: "Pescadería" },
  { value: "charcuteria", label: "Charcutería" },
  { value: "lacteos", label: "Lácteos" },
  { value: "congelados", label: "Congelados" },
  { value: "bebidas", label: "Bebidas" },
  { value: "conservas", label: "Conservas" },
  { value: "bodega", label: "Bodega" },
  { value: "drogueria", label: "Droguería" },
  { value: "perfumeria", label: "Perfumería" },
  { value: "higiene", label: "Higiene" },
  { value: "otros", label: "Otros" },
];

export function storeTypeLabel(value: StoreType | null): string | null {
  return STORE_TYPES.find((t) => t.value === value)?.label ?? null;
}

export function storeChainLabel(value: StoreChain | null): string | null {
  return STORE_CHAINS.find((c) => c.value === value)?.label ?? null;
}

export function categoryLabel(value: ProductCategory | null): string | null {
  return CATEGORIES.find((c) => c.value === value)?.label ?? null;
}
