#!/usr/bin/env python3
"""Fill regionalIcm, ics, address in each src/lib/cores/locations/<LOCODE>.ts from logisticsDatabase.ts."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOC_DIR = ROOT / "src/lib/cores/locations"
LOGISTICS_TS = LOC_DIR / "logisticsDatabase.ts"

# Same as index.ts — spreadsheet row key when it differs from the site file name.
ALIASES = {"US-DNN01": "US-DNN02", "US-CSZ02": "US-CSZ01"}

SKIP = {"types.ts", "index.ts", "logisticsDatabase.ts"}


def load_logistics_strings():
    text = LOGISTICS_TS.read_text(encoding="utf-8")
    by_key = {}

    for m in re.finditer(r'^  ("(?:[^"\\]|\\.)*"):\s*\{', text, re.MULTILINE):
        locode = json.loads(m.group(1))
        start = m.end() - 1  # position of '{'
        depth = 0
        i = start
        while i < len(text):
            c = text[i]
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    block = text[start + 1 : i]
                    break
            i += 1
        else:
            continue

        out = {"regionalIcm": "", "ics": "", "address": ""}
        for key in ("regionalIcm", "ics", "address"):
            lm = re.search(rf"^\s*{re.escape(key)}:\s*((?:\"(?:\\\\.|[^\"\\\\])*\")|)\s*,?\s*$", block, re.MULTILINE)
            if lm and lm.group(1):
                try:
                    out[key] = json.loads(lm.group(1))
                except json.JSONDecodeError:
                    out[key] = ""
        by_key[locode] = out

    return by_key


def extract_existing_fields(src: str):
    code = re.search(r'code:\s*"([^"]+)"', src).group(1)
    label_m = re.search(r"label:\s*`([^`]*)`", src)
    if not label_m:
        raise ValueError("expected label backticks")
    label = label_m.group(1)
    timezone = re.search(r'timezone:\s*"((?:\\.|[^"\\])*)"', src).group(1)
    zip_code = re.search(r'zipCode:\s*"((?:\\.|[^"\\])*)"', src).group(1)
    # unescape for re-emitting as json.dumps
    timezone = json.loads(f'"{timezone}"')
    zip_code = json.loads(f'"{zip_code}"')
    return code, label, timezone, zip_code


def main():
    by_key = load_logistics_strings()
    for path in sorted(LOC_DIR.glob("*.ts")):
        if path.name in SKIP:
            continue
        code = path.stem
        lookup = ALIASES.get(code, code)
        tri = by_key.get(lookup, {"regionalIcm": "", "ics": "", "address": ""})

        src = path.read_text(encoding="utf-8")
        code_e, label, timezone, zip_code = extract_existing_fields(src)

        if code_e != code:
            raise SystemExit(f"code mismatch {path}: {code_e} vs {code}")

        body = f"""import type {{ CoreWeaveLocation }} from "./types";

export const location: CoreWeaveLocation = {{
  code: {json.dumps(code)},
  label: `{label}`,
  timezone: {json.dumps(timezone)},
  zipCode: {json.dumps(zip_code)},
  regionalIcm: {json.dumps(tri["regionalIcm"])},
  ics: {json.dumps(tri["ics"])},
  address: {json.dumps(tri["address"])},
}};
"""
        path.write_text(body, encoding="utf-8")
        print("updated", path.name)

    print("done")


if __name__ == "__main__":
    main()
