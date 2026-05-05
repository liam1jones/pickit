# PickIT site locations and logistics data

**Date:** 2026-04-29  
**Scope:** `src/lib/cores/locations`, `docs/Corey ICS Site list.ods`, supporting scripts, and `src/App.jsx` integration.

This note records the work done to move CoreWeave-style site codes out of `App.jsx`, model them in TypeScript, and attach the **Logistics Database** sheet from the Corey ICS site list spreadsheet.

---

## 1. Componentized `LOCODES` (per-site modules)

**Before:** A single `LOCODES` string array lived in `src/App.jsx` (legacy full labels such as `US-BVI01 – Breinigsville, PA`).

**After:**

- Each site has its own file under `src/lib/cores/locations/`, named by LOCODE (e.g. `US-BVI01.ts`, `CA-GAL01.ts`, `ES-BCN01.ts`).
- Shared typing lives in `types.ts`.
- `index.ts` imports every site, builds **`ALL_LOCATIONS`** (ordered like the original `LOCODES`), and exposes **`LOCODES`** as `ALL_LOCATIONS.map((l) => l.label)` so existing selects keep the same strings and values.

**`App.jsx`:** The inline array was removed; the app imports `LOCODES` from `./lib/cores/locations`.

**Per-site file shape (evolved in later steps):** Each file exports `location` with at least `code`, `label`, `timezone` (IANA), `zipCode` (US ZIP or international postal code), and later `regionalIcm`, `ics`, and `address` (see below).

---

## 2. Types (`types.ts`)

- **`CoreWeaveLocation`** — Site metadata: `code`, `label`, `timezone`, `zipCode`, `regionalIcm`, `ics`, `address`, and optional **`logistics`** (full logistics row).
- **`SiteLogistics`** — All questionnaire-style columns from the Logistics Database tab (dock, PPE, security, contacts, delivery windows, etc.), as strings (many values are Yes/No/empty or free text from the sheet).

---

## 3. Logistics Database → `logisticsDatabase.ts`

**Source:** `docs/Corey ICS Site list.ods`, sheet **Logistics Database** (column A = `LOCODE`, remaining columns = logistics fields).

**Generated file:** `src/lib/cores/locations/logisticsDatabase.ts`

- Exports **`LOGISTICS_BY_LOCODE`**: `Record<string, SiteLogistics>`.
- Covers every row present in that sheet (including sites that are not in the PickIT `ALL_LOCATIONS` list, e.g. partial or alternate codes).

**Regenerate after editing the ODS:**

```bash
python3 scripts/ingest-logistics-ods.py
```

The ingest script uses Python + `xml.etree.ElementTree` on `content.xml` inside the ODS zip, including correct handling of `number-columns-repeated` on cells (required so columns do not shift).

---

## 4. Merging logistics into `ALL_LOCATIONS` (`index.ts`)

- Imports **`LOGISTICS_BY_LOCODE`**.
- **`withLogistics(loc)`** attaches `logistics` when a row exists for that site’s lookup key.
- **Aliases** (spreadsheet LOCODE ≠ catalog file / app code):
  - **`US-DNN01`** uses the **`US-DNN02`** row (Dalton entry in the sheet).
  - **`US-CSZ02`** uses the **`US-CSZ01`** row (paired Chester / Richmond site data).
- **`US-LNS01`** has no matching row in the sheet as of this work → no `logistics` object on that entry (top-level `regionalIcm` / `ics` / `address` remain empty unless filled later).

**Re-exports from `src/lib/cores/locations` (index):** `LOCODES`, `ALL_LOCATIONS`, `LOGISTICS_BY_LOCODE`, types `CoreWeaveLocation` and `SiteLogistics`.

---

## 5. Regional ICM, ICS, and address on each site file

The first three logistics columns (**Regional ICM**, **ICS**, **Address**) were also written onto each **`{LOCODE}.ts`** file so they are visible next to timezone/zip without opening the full `logistics` object.

- **`CoreWeaveLocation`** was extended with required **`regionalIcm`**, **`ics`**, and **`address`** (same strings as inside `SiteLogistics` for that site).
- Values are sourced from **`logisticsDatabase.ts`** using the same alias rules as `index.ts`.
- **`scripts/patch-location-ics-from-logistics.py`** parses `logisticsDatabase.ts` and rewrites every per-site `.ts` except `types.ts`, `index.ts`, and `logisticsDatabase.ts`.

**After regenerating `logisticsDatabase.ts`, refresh the per-site three fields:**

```bash
python3 scripts/patch-location-ics-from-logistics.py
```

---

## 6. File inventory (locations package)

| Artifact | Role |
|----------|------|
| `types.ts` | `CoreWeaveLocation`, `SiteLogistics` |
| `*.ts` (per LOCODE) | Static site record + ICS trio |
| `logisticsDatabase.ts` | Full logistics rows by LOCODE (generated) |
| `index.ts` | Compose `ALL_LOCATIONS`, `LOCODES`, merge `logistics`, re-exports |
| `scripts/ingest-logistics-ods.py` | ODS → `logisticsDatabase.ts` |
| `scripts/patch-location-ics-from-logistics.py` | `logisticsDatabase.ts` → per-site `regionalIcm` / `ics` / `address` |

---

## 7. Design notes and caveats

- **`logistics`** on `CoreWeaveLocation` still includes `regionalIcm`, `ics`, and `address` again inside `SiteLogistics` — intentional duplication so the full sheet row stays intact for forms or exports; the top-level trio is for convenience in the small per-file modules.
- **Zip/postal codes** on per-site files are representative for the area, not necessarily the dock gate address from logistics.
- **International** sites use appropriate IANA time zones and postal formats in `zipCode` and in addresses from the sheet where present.

---

## 8. Naming convention for this doc

Template: `from.Corey.{YYYYMMDD}.{section}.{subSection}.md` under `docs/from.Corey/`.

This file: **`docs/from.Corey/from.Corey.20260429.locations.logistics.md`**

- **YYYYMMDD:** `20260429` (authoritative session date in the project)
- **section:** `locations`
- **subsection:** `logistics`

Use another `{section}.{subSection}` pair for follow-on notes (for example `locations.ui` if documenting `App.jsx` select wiring).
