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
import type { CoreWeaveLocation } from "./types";

/** Ordered list of all site locations (same order as legacy LOCODES). */
export const ALL_LOCATIONS: CoreWeaveLocation[] = [
  US_BVI01,
  US_CMH01,
  US_CSZ01,
  US_CSZ02,
  US_CVG01,
  US_CVY01,
  US_DGV01,
  US_DNN01,
  US_EWS01,
  US_LNB01,
  US_LOE01,
  US_OBG01,
  US_PPY01,
  US_SVG01,
  US_WJQ01,
  US_LNS01,
  US_AAI01,
  US_DTN01,
  US_HMN01,
  US_PLZ01,
  US_PLZ02,
  US_RIN01,
  US_VO201,
  US_WCI01,
  US_CDZ01,
  US_EVI01,
  US_LZL01,
  US_KWO01,
  US_MKO01,
  US_SKY01,
  US_RRX01,
  US_LBB01,
  US_NNN01,
  US_HIO01,
  US_HIO02,
  US_HIO03,
  US_LAS01,
  US_LAS02,
  US_LAS03,
  US_LYF01,
  US_MSC01,
  US_NKQ01,
  US_PHX01,
  US_QNC01,
  US_SPK02,
  CA_GAL01,
  GB_CWY01,
  GB_PPL01,
  ES_BCN01,
  ES_BCN03,
  ES_AVQ01,
  NO_OVO01,
  SE_FAN01,
  DK_SVL01,
];

/** Legacy string labels for selects (full display text). */
export const LOCODES: string[] = ALL_LOCATIONS.map((l) => l.label);

export type { CoreWeaveLocation } from "./types";
