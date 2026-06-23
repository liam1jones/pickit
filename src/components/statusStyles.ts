/** SVG / flowchart chip colors for each ticket lifecycle status. */

import type { InventoryTheme } from "../lib/cores/inventory/theme";

/** Stable ticket lifecycle order (filters, workflow advance, board columns). */
export const STATS = [
  "Open / Submitted",
  "Pending Approval",
  "Approved – Pending Transfer",
  "Picked / Staged",
  "In Progress – Work Underway",
  "Excess Return Pending",
  "Resolved / Closed",
] as const;

export type TicketStatusKey = (typeof STATS)[number];

export type StatusStyle = {
  bg: string;
  fg: string;
  bd: string;
};

/** Badge / board column colors (`bg`, `tx`, `bd`) derived from app theme. */
export type StatusChipStyle = {
  bg: string;
  tx: string;
  bd: string;
};

export const STATUS_STYLE = {
  "Open / Submitted": { bg: "#252830", fg: "#9ca3af", bd: "rgba(255,255,255,0.18)" },
  "Pending Approval": { bg: "#252830", fg: "#cbd5e1", bd: "rgba(255,255,255,0.22)" },
  "Approved – Pending Transfer": { bg: "#451a03", fg: "#fcd34d", bd: "#f59e0b" },
  "Picked / Staged": { bg: "#1a2e1a", fg: "#6ee7b7", bd: "#34d399" },
  "In Progress – Work Underway": { bg: "#134e4a", fg: "#99f6e4", bd: "#2dd4bf" },
  "Excess Return Pending": { bg: "#451a03", fg: "#fcd34d", bd: "#f59e0b" },
  "Resolved / Closed": { bg: "#14532d", fg: "#86efac", bd: "#22c55e" },
} as const satisfies Record<TicketStatusKey, StatusStyle>;

/** Theme-aware status chip map for `Badge` and board column headers. */
export function getStatusChipStyles(
  theme: InventoryTheme,
): Record<string, StatusChipStyle> {
  return {
    "Open / Submitted": { bg: theme.bg3, tx: theme.t2, bd: theme.border },
    "Pending Approval": { bg: theme.bg3, tx: theme.t2, bd: theme.border },
    "Approved – Pending Transfer": { bg: theme.amberB, tx: theme.amberT, bd: theme.amber },
    "Picked / Staged": { bg: "#1a2e1a", tx: "#6ee7b7", bd: "#34d399" },
    "In Progress – Work Underway": { bg: theme.tealB, tx: theme.tealT, bd: theme.teal },
    "Excess Return Pending": { bg: theme.amberB, tx: theme.amberT, bd: theme.amber },
    "Resolved / Closed": { bg: theme.greenB, tx: theme.greenT, bd: theme.green },
  };
}
