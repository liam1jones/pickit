/**
 * Flowchart / onboarding persona definitions (JTBD, actions, presentation colors).
 * Used by `FlowchartView` for the personas legend and SVG actor labels.
 */

export type FlowchartRoleKey = "DCT" | "DCM" | "ICS" | "Vendor" | "Accounting";

export type FlowchartRole = {
  key: FlowchartRoleKey;
  label: string;
  dot: string;
  fg: string;
  bg: string;
  jtbd: string;
  actions: string[];
};

export const ROLES: readonly FlowchartRole[] = [
  {
    key: "DCT",
    label: "Data Center Tech",
    dot: "#3b82f6",
    fg: "#93c5fd",
    bg: "#1e3a5f",
    jtbd: "Submit material requests for a rack / data-hall job and confirm receipt.",
    actions: [
      "Open ticket (site, DH, rack, part, qty)",
      "Confirm materials received",
      "Comment / attach Asana link",
    ],
  },
  {
    key: "DCM",
    label: "DCM / Tiger Team",
    dot: "#22c55e",
    fg: "#86efac",
    bg: "#14532d",
    jtbd: "Approve the queue against budgets and SLAs.",
    actions: ["Approve or send back", "Own SLA breaches", "Spin up NSIM / project intakes"],
  },
  {
    key: "ICS",
    label: "ICS / RICM",
    dot: "#2dd4bf",
    fg: "#99f6e4",
    bg: "#134e4a",
    jtbd: "Pick, stage, and close out the physical inventory move.",
    actions: [
      "Pick & stage materials",
      "Scan QR tag to advance",
      "Flag excess / confirm return",
    ],
  },
  {
    key: "Vendor",
    label: "Vendor / Contractor",
    dot: "#a78bfa",
    fg: "#c4b5fd",
    bg: "#2e1065",
    jtbd: "Read-only view of work-orders assigned to their company.",
    actions: [
      "See assigned tickets",
      "View site & part lists",
      "Acknowledge schedule (post-MVP)",
    ],
  },
  {
    key: "Accounting",
    label: "Accounting",
    dot: "#f59e0b",
    fg: "#fcd34d",
    bg: "#451a03",
    jtbd: "Reconcile inventory movement against NetSuite postings.",
    actions: [
      "Pull closed-ticket exports",
      "Verify bin-transfer GL postings",
      "Monthly $ movement reports",
    ],
  },
];
