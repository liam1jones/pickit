import type { FlowchartIntegration } from "./types";

export const asanaIntegration: FlowchartIntegration = {
  name: "Asana",
  color: "#a78bfa",
  role: "Upstream work-tracking",
  notes: [
    "DCT pastes an Asana task ID on intake",
    "Link surfaces on the ticket detail and exports",
  ],
};
