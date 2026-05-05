import { location as US_BVI01 } from "./US-BVI01";
import { location as US_CMH01 } from "./US-CMH01";
import { location as US_CSZ01 } from "./US-CSZ01";
import { location as US_CSZ02 } from "./US-CSZ02";
import { location as US_CVG01 } from "./US-CVG01";
import { location as US_CVY01 } from "./US-CVY01";
import { location as US_DGV01 } from "./US-DGV01";
import { location as US_DNN01 } from "./US-DNN01";
import { location as US_EWS01 } from "./US-EWS01";
import { location as US_LNB01 } from "./US-LNB01";
import { location as US_LOE01 } from "./US-LOE01";
import { location as US_OBG01 } from "./US-OBG01";
import { location as US_PPY01 } from "./US-PPY01";
import { location as US_SVG01 } from "./US-SVG01";
import { location as US_WJQ01 } from "./US-WJQ01";
import { location as US_LNS01 } from "./US-LNS01";
import { location as US_AAI01 } from "./US-AAI01";
import { location as US_DTN01 } from "./US-DTN01";
import { location as US_HMN01 } from "./US-HMN01";
import { location as US_PLZ01 } from "./US-PLZ01";
import { location as US_PLZ02 } from "./US-PLZ02";
import { location as US_RIN01 } from "./US-RIN01";
import { location as US_VO201 } from "./US-VO201";
import { location as US_WCI01 } from "./US-WCI01";
import { location as US_CDZ01 } from "./US-CDZ01";
import { location as US_EVI01 } from "./US-EVI01";
import { location as US_LZL01 } from "./US-LZL01";
import { location as US_KWO01 } from "./US-KWO01";
import { location as US_MKO01 } from "./US-MKO01";
import { location as US_SKY01 } from "./US-SKY01";
import { location as US_RRX01 } from "./US-RRX01";
import { location as US_LBB01 } from "./US-LBB01";
import { location as US_NNN01 } from "./US-NNN01";
import { location as US_HIO01 } from "./US-HIO01";
import { location as US_HIO02 } from "./US-HIO02";
import { location as US_HIO03 } from "./US-HIO03";
import { location as US_LAS01 } from "./US-LAS01";
import { location as US_LAS02 } from "./US-LAS02";
import { location as US_LAS03 } from "./US-LAS03";
import { location as US_LYF01 } from "./US-LYF01";
import { location as US_MSC01 } from "./US-MSC01";
import { location as US_NKQ01 } from "./US-NKQ01";
import { location as US_PHX01 } from "./US-PHX01";
import { location as US_QNC01 } from "./US-QNC01";
import { location as US_SPK02 } from "./US-SPK02";
import { location as CA_GAL01 } from "./CA-GAL01";
import { location as GB_CWY01 } from "./GB-CWY01";
import { location as GB_PPL01 } from "./GB-PPL01";
import { location as ES_BCN01 } from "./ES-BCN01";
import { location as ES_BCN03 } from "./ES-BCN03";
import { location as ES_AVQ01 } from "./ES-AVQ01";
import { location as NO_OVO01 } from "./NO-OVO01";
import { location as SE_FAN01 } from "./SE-FAN01";
import { location as DK_SVL01 } from "./DK-SVL01";
import { LOGISTICS_BY_LOCODE } from "./logisticsDatabase";
import type { CoreWeaveLocation } from "./types";

/**
 * App LOCODE → Logistics Database row key when the spreadsheet uses a different code
 * for the same or paired site (e.g. US-DNN02 row covers Dalton DC).
 */
const LOGISTICS_LOCODE_ALIASES: Partial<Record<string, string>> = {
  "US-DNN01": "US-DNN02",
  "US-CSZ02": "US-CSZ01",
};

function withLogistics(loc: Omit<CoreWeaveLocation, "logistics">): CoreWeaveLocation {
  const key = LOGISTICS_LOCODE_ALIASES[loc.code] ?? loc.code;
  const logistics = LOGISTICS_BY_LOCODE[key];
  return logistics ? { ...loc, logistics } : { ...loc };
}

/** Ordered list of all site locations (same order as legacy LOCODES). */
export const ALL_LOCATIONS: CoreWeaveLocation[] = [
  withLogistics(US_BVI01),
  withLogistics(US_CMH01),
  withLogistics(US_CSZ01),
  withLogistics(US_CSZ02),
  withLogistics(US_CVG01),
  withLogistics(US_CVY01),
  withLogistics(US_DGV01),
  withLogistics(US_DNN01),
  withLogistics(US_EWS01),
  withLogistics(US_LNB01),
  withLogistics(US_LOE01),
  withLogistics(US_OBG01),
  withLogistics(US_PPY01),
  withLogistics(US_SVG01),
  withLogistics(US_WJQ01),
  withLogistics(US_LNS01),
  withLogistics(US_AAI01),
  withLogistics(US_DTN01),
  withLogistics(US_HMN01),
  withLogistics(US_PLZ01),
  withLogistics(US_PLZ02),
  withLogistics(US_RIN01),
  withLogistics(US_VO201),
  withLogistics(US_WCI01),
  withLogistics(US_CDZ01),
  withLogistics(US_EVI01),
  withLogistics(US_LZL01),
  withLogistics(US_KWO01),
  withLogistics(US_MKO01),
  withLogistics(US_SKY01),
  withLogistics(US_RRX01),
  withLogistics(US_LBB01),
  withLogistics(US_NNN01),
  withLogistics(US_HIO01),
  withLogistics(US_HIO02),
  withLogistics(US_HIO03),
  withLogistics(US_LAS01),
  withLogistics(US_LAS02),
  withLogistics(US_LAS03),
  withLogistics(US_LYF01),
  withLogistics(US_MSC01),
  withLogistics(US_NKQ01),
  withLogistics(US_PHX01),
  withLogistics(US_QNC01),
  withLogistics(US_SPK02),
  withLogistics(CA_GAL01),
  withLogistics(GB_CWY01),
  withLogistics(GB_PPL01),
  withLogistics(ES_BCN01),
  withLogistics(ES_BCN03),
  withLogistics(ES_AVQ01),
  withLogistics(NO_OVO01),
  withLogistics(SE_FAN01),
  withLogistics(DK_SVL01),
];

/** Legacy string labels for selects (full display text). */
export const LOCODES: string[] = ALL_LOCATIONS.map((l) => l.label);

export { LOGISTICS_BY_LOCODE } from "./logisticsDatabase";
export type { CoreWeaveLocation, SiteLogistics } from "./types";
