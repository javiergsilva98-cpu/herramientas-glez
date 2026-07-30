export type QuantityUnit = "unidades" | "kg" | "g";

export type StoreType =
  | "supermercado"
  | "vivero"
  | "leroy_merlin"
  | "ikea"
  | "decathlon"
  | "carniceria_canencia";

export type StoreChain = "mercadona" | "carrefour" | "lidl" | "ahorramas";

export type ProductCategory =
  | "fruteria"
  | "verduleria"
  | "panaderia"
  | "carniceria"
  | "pescaderia"
  | "charcuteria"
  | "lacteos"
  | "congelados"
  | "bebidas"
  | "conservas"
  | "bodega"
  | "drogueria"
  | "perfumeria"
  | "higiene"
  | "otros";

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  quantity_unit: QuantityUnit;
  store_type: StoreType | null;
  store_chain: StoreChain | null;
  category: ProductCategory | null;
  is_urgent: boolean;
  is_checked: boolean;
  created_at: string;
  checked_at: string | null;
};
