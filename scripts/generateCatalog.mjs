/**
 * One-shot generator: turns References/NSIM Item Master 4-16-26 .csv into one
 * TypeScript file per vendor under src/lib/catalog/, mirroring the shape of
 * lumaOptics.ts. Also writes a types.ts and an index.ts aggregator.
 *
 *   node scripts/generateCatalog.mjs
 *
 * Re-runnable. Existing lumaOptics.ts is preserved; index.ts re-exports it.
 */
import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CSV_PATH = resolve(ROOT, "References", "NSIM Item Master 4-16-26 .csv");
const OUT_DIR = resolve(ROOT, "src", "lib", "catalog");

// ───────────────────────── CSV PARSER ─────────────────────────
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; continue; }
        inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* ignore */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ───────────────────────── VENDOR CANONICALIZATION ─────────────────────────
/** Pseudo-vendors / dirty values that aren't real companies — skip. */
const PSEUDO_VENDORS = new Set([
  "", "GPU Server / Chassis", "CPU Server / Chassis", "Storage Server / Chassis",
  "Cabling", "Network Switches", "Support", "Optic", "Equipment", "License",
  "Rack", "PDUs", "CDU", "NIC/DPU", "Trunk Cable", "Server Component",
  "IT Infrastructure", "Machinery and Equipment", "RoHS", "UPS-PDUs",
  "Cabinets / Cages", "Network Communication",
]);

/** Vendors already covered by handwritten files — skip from generator. */
const SKIP_VENDORS = new Set(["luma", "lumaOptics"]);

/** Map dirty vendor strings to a canonical display name. */
const VENDOR_ALIASES = new Map(Object.entries({
  "Proficium": "Proficium",
  "Proficium Inc": "Proficium",
  "Proficium Inc.": "Proficium",
  "Anixter Inc": "Anixter",
  "Anixter Inc.": "Anixter",
  "Anixter": "Anixter",
  "Super Micro Computer Inc.": "Supermicro",
  "Supermicro": "Supermicro",
  "Molex LLC": "Molex",
  "Molex": "Molex",
  "Luma": "Luma",
  "Luma Optics": "Luma",
  "Ciena Communications": "Ciena",
  "Ciena Communications, Inc.": "Ciena",
  "Ciena": "Ciena",
  "FS": "FS",
  "FS.com": "FS",
  "FS.COM": "FS",
  "Nokia of America Corporation": "Nokia",
  "Nokia UK Limited": "Nokia",
  "Nokia Spain Sociedad Anónima": "Nokia",
  "Nokia": "Nokia",
  "Cisco": "Cisco",
  "Nvidia Corporation": "Nvidia",
  "NVIDIA Corporation": "Nvidia",
  "Nvidia": "Nvidia",
  "NVIDIA": "Nvidia",
  "NIVIDA": "Nvidia",
  "Networks Centre BV": "Networks Centre",
  "Networks Centre Ltd": "Networks Centre",
  "C-Connex LLC": "C-Connex",
  "C-CONNEX LLC": "C-Connex",
  "Dell": "Dell",
  "Dell Financial Services LLC": "Dell",
  "Dell Marketing L.P.": "Dell",
  "Arista": "Arista",
  "HPE": "HPE",
  "HPE Juniper Networking": "HPE Juniper",
  "HPE Juniper": "HPE Juniper",
  "Juniper/HPE": "HPE Juniper",
  "Sycomp UK Limited": "Sycomp",
  "Myriad 360": "Myriad 360",
  "Myriad 360 LLC": "Myriad 360",
  "Myriad": "Myriad 360",
  "MICFO S.L.": "MICFO",
  "EATON": "Eaton",
  "Eaton": "Eaton",
  "Delta Electronics": "Delta Electronics",
  "Delta Electronics Americas LTD": "Delta Electronics",
  "Data Direct Networks, Inc.": "DataDirect Networks",
  "DataDirect Networks": "DataDirect Networks",
  "Codecom": "Codecom",
  "Codecom LLC": "Codecom",
  "AFL": "AFL",
  "AFL Telecommunications LLC": "AFL",
  "SHI International": "SHI",
  "SHI International Corp": "SHI",
  "Ubiquiti": "Ubiquiti",
  "Ubiquiti Inc": "Ubiquiti",
  "Vast": "Vast",
  "Vast Data Inc": "Vast",
  "RWL": "RWL",
  "RWL BV": "RWL",
  "DEI Logistics (USA) Corporation": "DEI Logistics",
  "DET Logistics (USA) Corporation": "DEI Logistics",
  "Luma Inc": "Luma",
  "Lumma": "Luma",
}));

const canonicalVendor = (raw) => {
  const v = (raw || "").trim();
  if (PSEUDO_VENDORS.has(v)) return null;
  if (VENDOR_ALIASES.has(v)) return VENDOR_ALIASES.get(v);
  return v;
};

/** "Networks Centre" → "networksCentre", "C-Connex" → "cConnex", "MICFO" → "micfo".
 *  Leading digits are illegal in JS identifiers, so prefix those with `v` so we
 *  can safely use the slug as both a filename and an imported binding. */
const camelSlug = (name) => {
  const words = name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/);
  const raw = words.map((w, i) => i === 0 ? w : w[0].toUpperCase() + w.slice(1)).join("");
  return /^[0-9]/.test(raw) ? `v${raw}` : raw;
};

const idSlug = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ───────────────────────── CATEGORY MAPPING ─────────────────────────
const CATEGORY_MAP = [
  [/cabl/i, "cable"],
  [/transceiver|optic/i, "transceiver"],
  [/consumable|misc/i, "consumable"],
  [/server|chassis|switch|nic|dpu|rack|equipment|machinery|infrastruct|component|pdu|cdu|cabin/i, "hardware"],
  [/support|license|service/i, "service"],
];
const mapCategory = (raw) => {
  const v = (raw || "").trim();
  for (const [re, label] of CATEGORY_MAP) if (re.test(v)) return label;
  return "other";
};
const SPEC_PREFIX = {
  cable: "Cabling", transceiver: "Transceiver", consumable: "Consumable",
  hardware: "Hardware", service: "Service", other: "Item",
};

// ───────────────────────── TS LITERAL ENCODER ─────────────────────────
const enc = (s) => `'${String(s ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim()}'`;

function itemBlock(it) {
  return `  {
    id: ${enc(it.id)},
    model: ${enc(it.model)},
    manufacturer: ${enc(it.manufacturer)},
    category: ${enc(it.category)},
    description: ${enc(it.description)},
    partNumber: ${enc(it.partNumber)},
    estimatedCost: ${enc(it.estimatedCost)},
    specs: ${enc(it.specs)},
    vendorIds: [${enc(it.vendorIds[0])}],
  },`;
}

function vendorFile(varName, displayName, items) {
  const banner = `// AUTO-GENERATED by scripts/generateCatalog.mjs from References/NSIM Item Master 4-16-26 .csv\n// Vendor: ${displayName} · ${items.length} items. Re-run the script to refresh.\n`;
  return `${banner}import type { CatalogItem } from './types';\n\nconst ${varName}: CatalogItem[] = [\n${items.map(itemBlock).join("\n")}\n];\n\nexport default ${varName};\n`;
}

const TYPES_FILE = `/** Shared catalog item shape used by every vendor file under src/lib/catalog. */
export interface CatalogItem {
  id: string;
  model: string;
  manufacturer: string;
  /** Coarse bucket: cable | transceiver | consumable | hardware | service | other */
  category: string;
  description: string;
  partNumber: string;
  /** Pre-formatted currency string, e.g. '$123.45'. Empty when unknown. */
  estimatedCost: string;
  /** Free-form spec line shown beside the part. */
  specs: string;
  /** Slug(s) of the vendor file(s) this item belongs to. */
  vendorIds: string[];
}
`;

// ───────────────────────── MAIN ─────────────────────────
const csv = await readFile(CSV_PATH, "utf8");
const rows = parseCsv(csv);

// CSV header rows: row 0 = column names, rows 1-2 = type/required metadata.
const HEADER = rows[0];
const idx = (name) => HEADER.indexOf(name);
const COL = {
  itemNumber: idx("Item Number"),
  vendor: idx("Vendor"),
  description: idx("Description"),
  category: idx("Category"),
  price: idx("Price"),
  uom: idx("Unit of Measure"),
  mpn: idx("Manufacturers Part Number (MPN)"),
};

const groups = new Map(); // vendorDisplayName -> [items]
let skippedPseudo = 0, skippedLuma = 0, kept = 0;

for (let i = 3; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.every((c) => !c)) continue;
  const vendorRaw = (r[COL.vendor] || "").trim();
  const vendorName = canonicalVendor(vendorRaw);
  if (!vendorName) { skippedPseudo++; continue; }

  const slug = camelSlug(vendorName);
  if (SKIP_VENDORS.has(slug)) { skippedLuma++; continue; }

  const itemNumber = (r[COL.itemNumber] || "").trim();
  const description = (r[COL.description] || "").trim();
  const category = mapCategory(r[COL.category]);
  const mpn = (r[COL.mpn] || "").trim();
  const partNumber = mpn || itemNumber || "";
  if (!partNumber || !description) continue;

  const price = (r[COL.price] || "").trim();
  const uom = (r[COL.uom] || "").trim() || "Eaches";
  const specs = `${SPEC_PREFIX[category]} | UOM: ${uom}`;

  const item = {
    id: `${slug}-${idSlug(partNumber)}`,
    model: description,
    manufacturer: vendorRaw,           // keep the raw label for traceability
    category,
    description,
    partNumber,
    estimatedCost: price,
    specs,
    vendorIds: [slug],
  };

  if (!groups.has(vendorName)) groups.set(vendorName, []);
  groups.get(vendorName).push(item);
  kept++;
}

// Dedupe within each vendor by id, sort alphabetically by partNumber for stability.
for (const [v, items] of groups) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  out.sort((a, b) => a.partNumber.localeCompare(b.partNumber, "en", { numeric: true, sensitivity: "base" }));
  groups.set(v, out);
}

// Wipe previously generated files (anything starting with a vendor slug we own
// here, excluding lumaOptics.ts and types.ts/index.ts so we never touch them).
const PROTECT = new Set(["lumaOptics.ts", "types.ts", "index.ts"]);
if (existsSync(OUT_DIR)) {
  const existing = await readdir(OUT_DIR, { withFileTypes: true });
  for (const e of existing) {
    if (!e.isFile()) continue;
    if (PROTECT.has(e.name)) continue;
    if (!e.name.endsWith(".ts")) continue;
    const head = await readFile(resolve(OUT_DIR, e.name), "utf8").then((t) => t.slice(0, 120));
    if (head.includes("AUTO-GENERATED by scripts/generateCatalog.mjs")) {
      await unlink(resolve(OUT_DIR, e.name));
    }
  }
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(resolve(OUT_DIR, "types.ts"), TYPES_FILE);

const sortedVendors = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
const indexImports = [`import lumaOpticsCatalog from './lumaOptics';`];
const indexEntries = [`['lumaOptics', lumaOpticsCatalog],`];

for (const [vendorName, items] of sortedVendors) {
  const slug = camelSlug(vendorName);
  const varName = `${slug}Catalog`;
  const file = vendorFile(varName, vendorName, items);
  await writeFile(resolve(OUT_DIR, `${slug}.ts`), file);
  indexImports.push(`import ${varName} from './${slug}';`);
  indexEntries.push(`[${enc(slug)}, ${varName}],`);
}

const INDEX_FILE = `// AUTO-GENERATED by scripts/generateCatalog.mjs — re-run to refresh.
import type { CatalogItem } from './types';
${indexImports.join("\n")}

/** Map of vendor slug -> catalog. Add hand-written vendors above the loop. */
export const VENDOR_CATALOGS: Record<string, CatalogItem[]> = Object.fromEntries([
  ${indexEntries.join("\n  ")}
]);

/** Flat list across every vendor catalog. */
export const ALL_CATALOG_ITEMS: CatalogItem[] = Object.values(VENDOR_CATALOGS).flat();

export type { CatalogItem };
`;
await writeFile(resolve(OUT_DIR, "index.ts"), INDEX_FILE);

console.log(`parsed ${rows.length - 3} data rows; kept ${kept}, skipped ${skippedPseudo} pseudo-vendor rows, ${skippedLuma} Luma rows.`);
console.log(`wrote ${sortedVendors.length} vendor files + types.ts + index.ts to ${OUT_DIR}`);
console.log("top vendors:");
for (const [v, items] of sortedVendors.slice(0, 15)) console.log(`  ${camelSlug(v).padEnd(20)} ${items.length.toString().padStart(4)}  (${v})`);
