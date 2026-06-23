import type { CatalogItem } from "../../catalog/types";
import supermicroCatalog from "../../catalog/supermicro";

/**
 * Part numbers that historically appeared in the monolithic `VENDOR_MAP` for
 * Supermicro-labeled rows in PartSearch / ticket detail (not every row in
 * `catalog/supermicro.ts`).
 */
const SUPERMAP_PART_NUMBERS = new Set<string>([
  "TRX-MMA1Z00-NS400",
  "CBL-PWEX-1042",
  "CBL-PWEX-1136-40",
  "CBL-PWEX-1136YB-25",
  "CBL-PWEX-1142-40",
  "CBL-PWEX-1142B-40",
  "CBL-PWEX-0665",
  "CBL-PWEX-1017",
  "CBL-MCIO-1332M5",
  "CBL-MCIO-1324M5",
  "CBL-MCIO-1225M5",
  "CBL-MCIO-1233M5R",
  "CBL-MCIO-1226M5R",
  "CBL-MCIO-1226AM5R",
  "CBL-MCIO-1245U2Y-E",
  "CBL-OTHR-0604-53",
  "MCP-280-00033-0N",
  "CBL-0223L",
]);

/** Short label merged into global `VENDOR_MAP` (UI), distinct from `CatalogItem.manufacturer` legal name. */
const VENDOR_MAP_LABEL = "Supermicro";

/**
 * Subset of `catalog/supermicro.ts` as **array of `CatalogItem` objects** — same
 * field names and types as the generated catalog (`id`, `model`, `manufacturer`,
 * `category`, `description`, `partNumber`, `estimatedCost`, `specs`, `vendorIds`).
 *
 * Sorted by `partNumber` so the file stays stable across catalog regen order changes.
 */
export const supermicroVendorCatalogItems: CatalogItem[] = supermicroCatalog
  .filter((item) => SUPERMAP_PART_NUMBERS.has(item.partNumber))
  .sort((a, b) => a.partNumber.localeCompare(b.partNumber, "en", { numeric: true, sensitivity: "base" }));

if (import.meta.env?.DEV && supermicroVendorCatalogItems.length !== SUPERMAP_PART_NUMBERS.size) {
  console.warn(
    "[vendors/supermicro] Expected one catalog row per curated part; check NSIM regen vs SUPERMAP_PART_NUMBERS.",
    { expected: SUPERMAP_PART_NUMBERS.size, got: supermicroVendorCatalogItems.length },
  );
}

/**
 * `partNumber` → display string for `VENDOR_MAP` / `index.ts` spread (unchanged UI copy).
 */
export const supermicroVendorPartMap: Record<string, string> = Object.fromEntries(
  supermicroVendorCatalogItems.map((item) => [item.partNumber, VENDOR_MAP_LABEL]),
);
