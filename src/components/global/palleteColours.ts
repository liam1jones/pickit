/** Cyclic chart colors for Analytics overview (units by site / part). */
export const PALETTE_COLOURS = [
  "#3b82f6",
  "#2dd4bf",
  "#a78bfa",
  "#f59e0b",
  "#22c55e",
  "#f87171",
  "#e879f9",
  "#fb923c",
] as const;

export type PaletteColour = (typeof PALETTE_COLOURS)[number];
