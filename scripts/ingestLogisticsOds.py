#!/usr/bin/env python3
"""Read docs/Corey ICS Site list.ods → Logistics Database → logisticsDatabase.ts"""
import json
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ODS = ROOT / "docs/Corey ICS Site list.ods"
OUT = ROOT / "src/lib/cores/locations/logisticsDatabase.ts"

NS = {
    "table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
    "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
}

FIELD_KEYS = [
    "locode",
    "regionalIcm",
    "ics",
    "address",
    "loadingDockAvailable",
    "dockLevel",
    "dockDoorsWideEnoughLargePallets",
    "parkingForTrailersTrucks",
    "vehicleHeightRestrictions",
    "maximumClearance",
    "deliveryAppointmentsRequired",
    "securityBadgesRequired",
    "securityBadgeProcess",
    "securityEscortNeeded",
    "idRequiredDeliveryPersonnel",
    "indoorPpeRequired",
    "indoorPpeItems",
    "forkliftAvailable",
    "palletJackAvailable",
    "freightElevatorAvailable",
    "specialMaterialHandlingNeeded",
    "deliveryPathFreeOfObstructions",
    "onsiteStorageEarlyLateShipments",
    "deliveryIntegratedItProjectTeam",
    "onsiteInspectionBeforeDeparture",
    "workPhone",
    "workEmail",
    "requiredLeadTime",
    "deliveryTimeWindowsOrBlackouts",
    "deliveryTimeWindowsDetails",
    "overnightAfterHoursReceivingPermitted",
    "emergencyDeliveryService",
    "emergencyDeliveryInstructions",
    "emergencyContactForExceptions",
    "emergencyContactNamePhone",
    "dimensionsCapacityKnown",
    "specifyService",
    "obstacles",
    "stairsOrRampsToEquipmentRoom",
    "receivingAreaIndoorOutdoor",
    "protectiveFloorCoveringRequired",
    "designatedUnpackingArea",
    "unpackingDurationConditions",
    "packagingDisposalService",
    "hazardousMaterialRestrictions",
    "hazardousMaterialRestrictionsDetail",
    "documentationRequiredOnArrival",
    "priorCustomsClearanceMandatory",
    "embargoedRestrictedItems",
    "embargoedRestrictedItemsList",
    "leadContact",
]

COLS = 51
assert len(FIELD_KEYS) == COLS


def cell_text(cell):
    parts = []
    for p in cell.findall(".//text:p", NS):
        parts.append("".join(p.itertext()))
    return "".join(parts).strip()


def row_cells(row):
    cells = []
    for cell in row.findall("table:table-cell", NS):
        repeat = int(
            cell.get("{urn:oasis:names:tc:opendocument:xmlns:table:1.0}number-columns-repeated")
            or "1"
        )
        t = cell_text(cell)
        for _ in range(repeat):
            cells.append(t)
    return cells


def main():
    with zipfile.ZipFile(ODS, "r") as zf:
        xml = zf.read("content.xml")
    root = ET.fromstring(xml)

    rows = []
    for tbl in root.findall(".//table:table", NS):
        name = tbl.get("{urn:oasis:names:tc:opendocument:xmlns:table:1.0}name")
        if name != "Logistics Database":
            continue
        for row in tbl.findall("table:table-row", NS):
            cells = row_cells(row)
            if any(cells):
                rows.append(cells)
        break
    else:
        raise SystemExit('Sheet "Logistics Database" not found')

    hdr = rows[0][:COLS]
    if hdr[0].strip() != "LOCODE":
        raise SystemExit(f"Unexpected header: {hdr[0]!r}")

    by_locode = {}
    for r in rows[1:]:
        r = (r + [""] * COLS)[:COLS]
        locode = r[0].strip()
        if not locode:
            continue
        by_locode[locode] = {FIELD_KEYS[i]: r[i] for i in range(1, COLS)}

    def ts_entry(locode, o):
        lines = ["  " + json.dumps(locode) + ": {"]
        for k in FIELD_KEYS[1:]:
            lines.append(f"    {k}: {json.dumps(o.get(k, ''))},")
        lines.append("  },")
        return "\n".join(lines)

    header = '''/**
 * Logistics fields from `docs/Corey ICS Site list.ods` → sheet **Logistics Database**.
 * Keys are LOCODE values from column A. Regenerate: `python3 scripts/ingestLogisticsOds.py`
 */
import type { SiteLogistics } from "./types";

'''

    body = (
        header
        + "export const LOGISTICS_BY_LOCODE: Record<string, SiteLogistics> = {\n"
        + "\n".join(ts_entry(k, by_locode[k]) for k in sorted(by_locode))
        + "\n};\n"
    )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="utf-8")
    print("Wrote", OUT, "sites:", len(by_locode))


if __name__ == "__main__":
    main()
