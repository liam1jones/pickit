/**
 * Serialized asset inventory under `src/lib/cores/inventory/serializedAssets/`.
 *
 * Category modules (plus shared `types.ts`):
 * - `nodes.ts` — Nodes
 * - `switches.ts` — Switches
 * - `cables.ts` — Cables
 * - `qsfps.ts` — Transceivers
 * - `cabinets.ts` — Cabinets
 * - `pdus.ts` — PDUs
 *
 * Per-model specifications live in matching subfolders (`nodes/`, `switches/`, …),
 * ported from `00.References/from.dcSupreme/datacenterCore`.
 */

import { cabinetsCategory } from "./cabinets";
import {
  CabinetSpecifications,
  Dell44Specification,
  Generic48Specification,
} from "./cabinets/index";
import { cablesCategory } from "./cables";
import {
  CableSpecifications,
  CopperCat6aSpecification,
  FibreLCLCSpecification,
  FibreMPOSpecification,
  FibreMPOSplitterSpecification,
} from "./cables/index";
import { nodesCategory } from "./nodes";
import {
  DellPowerEdgeXE9712Specification,
  DellXE9680H100Specification,
  DellXE9680H200Specification,
  NodeSpecifications,
} from "./nodes/index";
import { pdusCategory } from "./pdus";
import { EnlogicEN6950Specification, PDUSpecifications } from "./pdus/index";
import { qsfpsCategory } from "./qsfps";
import {
  CiscoQDD400GLR4SLUSpecification,
  CompatibleQDD400GLR4SSpecification,
  JuniperEXSFP10GELRLUSpecification,
  JuniperJNPQSFP100GLR4LUSpecification,
  MellanoxMMA4Z00NS400Specification,
  MellanoxMMA4Z00NSSpecification,
  MellanoxMMS1V00WMSpecification,
  MellanoxMMS1V70CMSpecification,
  TransceiverSpecifications,
} from "./qsfps/index";
import { switchesCategory } from "./switches";
import {
  NVIDIAMQM9790NS2FSpecification,
  NVIDIAMSN2201CB2FCSpecification,
  NVIDIAMSN3700CS2FCSpecification,
  NVIDIAMSN4700WS2FCSpecification,
  NVIDIASN5600Specification,
  SwitchSpecifications,
} from "./switches/index";
import type { CategoryPresentationTheme, SerializedAssetCategoryDef } from "./types";

export type {
  CableInventory,
  CableSpecification,
  Cabinet,
  CabinetSpecification,
  CategoryColorToken,
  CategoryPresentationTheme,
  Connection,
  ConnectionType,
  DataHall,
  Equipment,
  Measurement,
  PDUSpecification,
  Pod,
  SerializedAssetCategoryDef,
  ServerSpecification,
  SwitchSpecification,
  TransceiverSpecification,
} from "./types";

export { cabinetsCategory } from "./cabinets";
export { cablesCategory } from "./cables";
export { nodesCategory } from "./nodes";
export { pdusCategory } from "./pdus";
export { qsfpsCategory } from "./qsfps";
export { switchesCategory } from "./switches";

export {
  CabinetSpecifications,
  Dell44Specification,
  Generic48Specification,
};
export {
  CableSpecifications,
  CopperCat6aSpecification,
  FibreLCLCSpecification,
  FibreMPOSpecification,
  FibreMPOSplitterSpecification,
};
export {
  DellPowerEdgeXE9712Specification,
  DellXE9680H100Specification,
  DellXE9680H200Specification,
  NodeSpecifications,
};
export { EnlogicEN6950Specification, PDUSpecifications };
export {
  CiscoQDD400GLR4SLUSpecification,
  CompatibleQDD400GLR4SSpecification,
  JuniperEXSFP10GELRLUSpecification,
  JuniperJNPQSFP100GLR4LUSpecification,
  MellanoxMMA4Z00NS400Specification,
  MellanoxMMA4Z00NSSpecification,
  MellanoxMMS1V00WMSpecification,
  MellanoxMMS1V70CMSpecification,
  TransceiverSpecifications,
};
export {
  NVIDIAMQM9790NS2FSpecification,
  NVIDIAMSN2201CB2FCSpecification,
  NVIDIAMSN3700CS2FCSpecification,
  NVIDIAMSN4700WS2FCSpecification,
  NVIDIASN5600Specification,
  SwitchSpecifications,
};

/** Stable order for serialized-asset category UI. */
export const SERIALIZED_ASSET_CATEGORIES: readonly SerializedAssetCategoryDef[] = [
  nodesCategory,
  switchesCategory,
  cablesCategory,
  qsfpsCategory,
  cabinetsCategory,
  pdusCategory,
];

/** Category labels for serialized-asset forms and filters. */
export const ASSET_CATS: string[] = SERIALIZED_ASSET_CATEGORIES.map((c) => c.label);

/** All specification records keyed by category folder name. */
export const SERIALIZED_ASSET_SPECIFICATIONS = {
  nodes: NodeSpecifications,
  switches: SwitchSpecifications,
  cables: CableSpecifications,
  qsfps: TransceiverSpecifications,
  cabinets: CabinetSpecifications,
  pdus: PDUSpecifications,
} as const;

/**
 * `label` → chip color from the app theme (`D` in App.jsx).
 */
export function getSerializedAssetCategoryColorMap(
  theme: CategoryPresentationTheme,
): Record<string, string> {
  return Object.fromEntries(
    SERIALIZED_ASSET_CATEGORIES.map((c) => [c.label, theme[c.colorToken]]),
  );
}
