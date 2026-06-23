/**
 * NSIM catalog `category` bucket → part-search group label.
 *
 * Consumable-side buckets align with `consumables/` BOM labels; `hardware` maps to
 * the serialized-asset family (Nodes, Switches, Cabinets, PDUs in `serializedAssets/`).
 */

import {
  cablesCopperCategory,
  cablesFibreCategory,
  cleanersCategory,
  opticsCategory,
  otherCategory,
} from "./consumables";
import type { InventoryTheme } from "./theme";

/** Umbrella for NSIM `cable` (spans consumable copper + fibre BOM categories). */
export const CABLING_GROUP_LABEL = "Cabling";

/**
 * NSIM `hardware` — servers, switches, PDUs, cabinets (`serializedAssets/`).
 * Display label kept as `"Hardware"`; chip color uses serialized `green` (Switches).
 */
export const HARDWARE_CATALOG_GROUP_LABEL = "Hardware";

export const CATALOG_GROUP_LABEL = {
  cable: CABLING_GROUP_LABEL,
  transceiver: opticsCategory.label,
  consumable: cleanersCategory.label,
  hardware: HARDWARE_CATALOG_GROUP_LABEL,
  service: "Services",
  other: otherCategory.label,
} as const satisfies Record<string, string>;

export type CatalogCategoryKey = keyof typeof CATALOG_GROUP_LABEL;

const CATALOG_GROUP_COLOR_TOKENS: Record<string, keyof InventoryTheme> = {
  [CABLING_GROUP_LABEL]: cablesFibreCategory.colorToken,
  [opticsCategory.label]: opticsCategory.colorToken,
  [cleanersCategory.label]: cleanersCategory.colorToken,
  [HARDWARE_CATALOG_GROUP_LABEL]: "green",
  Services: "t2",
  [otherCategory.label]: otherCategory.colorToken,
  // Legacy part-search headers still present in cached exports
  "Optics / Transceivers": opticsCategory.colorToken,
  Consumables: cleanersCategory.colorToken,
  [cablesCopperCategory.label]: cablesCopperCategory.colorToken,
  [cablesFibreCategory.label]: cablesFibreCategory.colorToken,
};

/** Part-search group header → chip color from `D`. */
export function getCatalogGroupColorMap(
  theme: InventoryTheme,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(CATALOG_GROUP_COLOR_TOKENS).map(([label, token]) => [
      label,
      theme[token],
    ]),
  );
}
