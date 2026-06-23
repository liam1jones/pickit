import type { InventoryTheme } from "../theme";

/** Theme tokens used for project / BOM category chips (subset of `D`). */
export type CategoryPresentationTheme = Pick<
  InventoryTheme,
  "blue" | "teal" | "amber" | "purple" | "t3"
>;

export type CategoryColorToken = keyof CategoryPresentationTheme;

export type InventoryCategoryDef = {
  label: string;
  colorToken: CategoryColorToken;
};
