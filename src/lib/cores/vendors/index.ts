/**
 * Merged part-number → vendor display name (PickIT PartSearch / ticket lines).
 * Built from per-vendor maps under this directory.
 */
import { aristaVendorPartMap } from "./arista";
import { asaComputersVendorPartMap } from "./asaComputers";
import { cableleaderVendorPartMap } from "./cableleader";
import { cablesComVendorPartMap } from "./cablesCom";
import { cConnexVendorPartMap } from "./cConnex";
import { cienaVendorPartMap } from "./ciena";
import { ciscoVendorPartMap } from "./cisco";
import { codecomVendorPartMap } from "./codecom";
import { dellVendorPartMap } from "./dell";
import { eatonVendorPartMap } from "./eaton";
import { fiberMallVendorPartMap } from "./fiberMall";
import { finisarVendorPartMap } from "./finisar";
import { flexoptixVendorPartMap } from "./flexoptix";
import { fsVendorPartMap } from "./fs";
import { fsComVendorPartMap } from "./fsCom";
import { fsDotComVendorPartMap } from "./fsDotCom";
import { graybarVendorPartMap } from "./graybar";
import { hpeVendorPartMap } from "./hpe";
import { hpeJuniperVendorPartMap } from "./hpeJuniper";
import { intelVendorPartMap } from "./intel";
import { lumaVendorPartMap } from "./luma";
import { lumaOpticsVendorPartMap } from "./lumaOptics";
import { mellanoxVendorPartMap } from "./mellanox";
import { molexVendorPartMap } from "./molex";
import { myriad360VendorPartMap } from "./myriad360";
import { nokiaVendorPartMap } from "./nokia";
import { nvidiaVendorPartMap } from "./nvidia";
import { nvidiaCapsVendorPartMap } from "./nvidiaCaps";
import { proficiumVendorPartMap } from "./proficium";
import { shiVendorPartMap } from "./shi";
import { siemonVendorPartMap } from "./siemon";
import { sourcePhotonicsVendorPartMap } from "./sourcePhotonics";
import { supermicroVendorPartMap } from "./supermicro";
import { tenGtekVendorPartMap } from "./tenGtek";
import { ubiquitiVendorPartMap } from "./ubiquiti";
import { voltiveVendorPartMap } from "./voltive";
import { waveSplitterVendorPartMap } from "./waveSplitter";

export const VENDOR_MAP: Record<string, string> = {
  ...aristaVendorPartMap,
  ...asaComputersVendorPartMap,
  ...cableleaderVendorPartMap,
  ...cablesComVendorPartMap,
  ...cConnexVendorPartMap,
  ...cienaVendorPartMap,
  ...ciscoVendorPartMap,
  ...codecomVendorPartMap,
  ...dellVendorPartMap,
  ...eatonVendorPartMap,
  ...fiberMallVendorPartMap,
  ...finisarVendorPartMap,
  ...flexoptixVendorPartMap,
  ...fsVendorPartMap,
  ...fsComVendorPartMap,
  ...fsDotComVendorPartMap,
  ...graybarVendorPartMap,
  ...hpeVendorPartMap,
  ...hpeJuniperVendorPartMap,
  ...intelVendorPartMap,
  ...lumaVendorPartMap,
  ...lumaOpticsVendorPartMap,
  ...mellanoxVendorPartMap,
  ...molexVendorPartMap,
  ...myriad360VendorPartMap,
  ...nokiaVendorPartMap,
  ...nvidiaVendorPartMap,
  ...nvidiaCapsVendorPartMap,
  ...proficiumVendorPartMap,
  ...shiVendorPartMap,
  ...siemonVendorPartMap,
  ...sourcePhotonicsVendorPartMap,
  ...supermicroVendorPartMap,
  ...tenGtekVendorPartMap,
  ...ubiquitiVendorPartMap,
  ...voltiveVendorPartMap,
  ...waveSplitterVendorPartMap,
};
