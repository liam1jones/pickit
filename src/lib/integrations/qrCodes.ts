import type { FlowchartIntegration } from "./types";

export const qrCodesIntegration: FlowchartIntegration = {
  name: "QR codes",
  color: "#3b82f6",
  role: "Floor-level scan-to-advance",
  notes: [
    "QR tag printed when a kit is staged",
    "ICS scan flips ticket → Picked / Staged",
    "Mobile portal opens the ticket on scan",
  ],
};
