import type { FlowchartIntegration } from "./types";

export const netSuiteIntegration: FlowchartIntegration = {
  name: "NetSuite",
  color: "#22c55e",
  role: "System of record for inventory",
  notes: [
    "Fires bin transfer Stored → In Process on Materials received",
    "Fires bin transfer In Process → Stored on Confirm return",
    "Item master nightly sync feeds the parts catalog",
  ],
};
