/**
 * External systems shown on the Flowchart view (PRD §9 integrations).
 */

import { asanaIntegration } from "./asana";
import { netSuiteIntegration } from "./netSuite";
import { qrCodesIntegration } from "./qrCodes";
import { tableauIntegration } from "./tableau";
import type { FlowchartIntegration } from "./types";

export type { FlowchartIntegration } from "./types";

export { asanaIntegration } from "./asana";
export { netSuiteIntegration } from "./netSuite";
export { qrCodesIntegration } from "./qrCodes";
export { tableauIntegration } from "./tableau";

/** Stable order for FlowchartView integration cards. */
export const INTEGRATIONS: readonly FlowchartIntegration[] = [
  netSuiteIntegration,
  asanaIntegration,
  qrCodesIntegration,
  tableauIntegration,
];
