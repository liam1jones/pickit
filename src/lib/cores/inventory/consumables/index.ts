/**
 * Project BOM category definitions under `src/lib/cores/inventory/consumables/`.
 *
 * One module per category (plus shared `types.ts`):
 * - `optics.ts` — Optics
 * - `cables.copper.ts` — Cables · Copper
 * - `cables.fibre.ts` — Cables · Fibre
 * - `cleaners.ts` — Cleaners (was Consumables)
 * - `velcro.ts` — Velcro (was Hardware)
 * - `other.ts` — Other
 *
 * App.jsx imports `CATS` and `getCategoryColorMap(D)` for BOM chips and `<select>` options.
 */

import { cablesCopperCategory } from "./cables.copper";
import { cablesFibreCategory } from "./cables.fibre";
import { cleanersCategory } from "./cleaners";
import { opticsCategory } from "./optics";
import { otherCategory } from "./other";
import { velcroCategory } from "./velcro";
import type { CategoryPresentationTheme, InventoryCategoryDef } from "./types";

export type { CategoryColorToken, CategoryPresentationTheme, InventoryCategoryDef } from "./types";

export { cablesCopperCategory } from "./cables.copper";
export { cablesFibreCategory } from "./cables.fibre";
export { cleanersCategory } from "./cleaners";
export { opticsCategory } from "./optics";
export { otherCategory } from "./other";
export { velcroCategory } from "./velcro";

/** Stable order for project BOM category `<select>` options. */
export const INVENTORY_CATEGORIES: readonly InventoryCategoryDef[] = [
  opticsCategory,
  cablesCopperCategory,
  cablesFibreCategory,
  cleanersCategory,
  velcroCategory,
  otherCategory,
];

/**
 * Category labels for BOM forms — includes `"Cleaners"` and `"Velcro"` (not legacy
 * `"Consumables"` / `"Hardware"`).
 * @see cleaners.ts
 * @see velcro.ts
 */
export const CATS: string[] = INVENTORY_CATEGORIES.map((c) => c.label);

/**
 * Pre-split / renamed labels still present on older seed rows or exports.
 * Renamed categories reuse the current module's `colorToken` (e.g. Hardware → velcro.ts).
 */
const LEGACY_CATEGORY_COLOR_TOKENS: Record<string, keyof CategoryPresentationTheme> = {
  Cables: "teal",
  Consumables: cleanersCategory.colorToken,
  Hardware: velcroCategory.colorToken,
};

/**
 * `label` → chip color from the app theme (`D` in App.jsx).
 * Current categories come from `INVENTORY_CATEGORIES`; legacy keys are merged for backward compatibility.
 */
export function getCategoryColorMap(
  theme: CategoryPresentationTheme,
): Record<string, string> {
  const fromCategories = Object.fromEntries(
    INVENTORY_CATEGORIES.map((c) => [c.label, theme[c.colorToken]]),
  );
  const fromLegacy = Object.fromEntries(
    Object.entries(LEGACY_CATEGORY_COLOR_TOKENS).map(([label, token]) => [
      label,
      theme[token],
    ]),
  );
  return { ...fromCategories, ...fromLegacy };
}
