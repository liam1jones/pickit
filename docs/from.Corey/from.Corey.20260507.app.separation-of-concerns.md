# `App.jsx` componentization and separation of concerns

**Date (from `date +%Y%m%d`):** `20260507`  
**Scope:** [`src/App.jsx`](../../src/App.jsx) (~1,630 lines) — analysis only; no code changes in this note.

PickIT currently keeps **routing by `view`**, **ticket/project state**, **NetSuite-adjacent behaviors**, **catalog derivation**, **theme tokens**, and **large JSX surfaces** in one file. The main offender is **`PickItApp`**, which defines dozens of `useState` hooks, business functions, and inline view fragments (`Topbar`, `BoardView`, `DetailView`, modals, analytics tabs) in a single closure.

Below: **concerns** (what is mixed today), **split candidates** (what to extract), and **dependency order** (extract low-coupling pieces first).

---

## 1. Current layering (as-is)

| Layer | What lives in `App.jsx` today |
|--------|-------------------------------|
| **Constants / config** | `D` (palette), `SC` (status chips), `STATS`, `PC`, `CATS`, `CC`, role colors, `VENDOR_MAP`, `USERS`, `LOCODES` import |
| **Catalog domain** | `parseCatalogUsd`, `PARTS_CATALOG` / `PARTS_CATALOG_FLAT`, `CATALOG_PRICE_BY_PN`, `bomUnitPrice` (depends on `ALL_CATALOG_ITEMS`) |
| **Seed / fixtures** | `INIT_TICKETS`, `INIT_PROJECTS`, `T0`…`T9`, helpers `mkD`, `tod`, `mkL`, `ticketQrValue` |
| **Utilities** | `csvExport`, `gid` / `gbt` (refs) |
| **UI primitives** | `Badge`, `Av`, `Hr`, `Bar`, shared `inpS` / `selS` / `btnS` |
| **Reusable widgets** | `PartSearch`, `ProjectSelector` (already “components” but colocated) |
| **Application shell** | `PickItApp`: all state, filters, derived analytics (`released`, `bySite`, `byPart`, …), mutations (`submitTicket`, `advance`, `fireNS`, …), and **all** main views as `const X = ( … JSX … )` inside the same function |
| **Auth shell** | Default `App` → `LoginScreen` vs `PickItApp` |

**Already separated:** `ViewNav`, `LoginScreen`; catalog list via `lib/catalog`; locations via `lib/cores/locations`.

---

## 2. Separation-of-concerns goals

1. **Presentation** — dumb or lightly-smart components: props in, events out; minimal knowledge of NetSuite or ticket rules.  
2. **Domain / application logic** — status transitions, ID generation, “what happens when ICS confirms receipt,” project BOM merges: testable without React.  
3. **Data / config** — maps and constants (`VENDOR_MAP`, theme, `USERS`, seed data) in modules that are easy to replace or load from an API later.  
4. **Side effects** — `console.log` stand-ins for NetSuite, `window.open` for QR print, `URL.createObjectURL` for CSV: isolate behind small functions or hooks so UI does not own file/print details.

---

## 3. High-value extractions (recommended)

### 3.1 Theme and form chrome (low risk)

- **Move** `D`, `inpS`, `selS`, `btnS`, and optionally `SC` / `CC` / role maps to e.g. `src/theme/pickit.js` or `src/lib/ui/theme.js`.  
- **Why:** Almost every future component will import tokens; avoids circular imports if widgets live under `components/`.

### 3.2 Catalog + vendor + part search (medium risk)

- **Move** `VENDOR_MAP`, `parseCatalogUsd`, `PARTS_CATALOG*`, `CATALOG_PRICE_BY_PN`, `bomUnitPrice` to `src/lib/catalog/` (or extend existing catalog module).  
- **Move** `PartSearch` to `src/components/parts/PartSearch.jsx` (or `.tsx`), passing in `catalog`, `vendorMap`, `theme`, `onChange`.  
- **Why:** `PartSearch` is self-contained; catalog math is pure and reusable for project BOM pricing.

### 3.3 Seed data and types (low risk)

- **Move** `INIT_TICKETS`, `INIT_PROJECTS`, ticket helpers, and mock users to `src/data/` or `src/fixtures/` (e.g. `fixtures/tickets.js`, `fixtures/users.js`).  
- **Why:** Shrinks `App.jsx` immediately; clarifies what is “demo” vs product code.

### 3.4 Small presentational components (low risk)

Extract with explicit props (no `PickItApp` closure):

| Candidate | Suggested file | Notes |
|-----------|----------------|--------|
| `Badge` | `components/ui/Badge.jsx` | Needs `status` + theme or `SC` map |
| `Av` | `components/ui/Avatar.jsx` | Initials circle |
| `Hr`, `Bar` | `components/ui/…` | Trivial layout helpers |
| `ProjectSelector` | `components/projects/ProjectSelector.jsx` | Already a function; pass `projects`, `allSites`, callbacks |

### 3.5 Modal surfaces (medium risk)

Each modal is a natural **component + optional hook**:

| Block in `PickItApp` | Suggested split |
|----------------------|-----------------|
| `FormModal` | `NewTicketModal` — props: `form`, setters, `submitTicket`, `PartSearch`, `LOCODES`, `USERS`, theme |
| `ExcessModal` | `ExcessReturnModal` — `exF`, `setExF`, `submitExcess`, `selT` |
| `WoModal` | `WorkOrderModal` — `woProject`, `woMemo`, `submitWorkOrder`, status |
| `NsToast` / `IcsToast` | `NetSuiteBinTransferToast`, `IcsNotifyToast` — or generic `Toast` + data |

**Why:** Reduces `PickItApp` body length; makes modal behavior easier to test in isolation.

### 3.6 Main views (higher risk, highest payoff)

These are large and depend on many handlers; still worth **named components** in separate files:

| Fragment | Suggested file | Dependencies to pass in |
|----------|----------------|-------------------------|
| `Topbar` | `components/layout/Topbar.jsx` | `view`, `setView`, `user`, `setUser`, `USERS`, filters, `LOCODES`, `D`, logo |
| `MRow` | `components/dashboard/MetricRow.jsx` | `mx` object or individual counts |
| `BoardView` | `components/tickets/BoardView.jsx` | `filtered`, `setSelId`, `setView`, theme, `Av` |
| `ListView` | `components/tickets/TicketTable.jsx` | same ticket list + navigation |
| `DetailView` | `components/tickets/TicketDetail.jsx` | `selT`, `projects`, all actions (`advance`, `closeT`, `addComment`, …), `ProjectSelector`, QR, `printQrTag` |
| `OverviewTab` | `components/analytics/OverviewTab.jsx` | date filters, `bySite`, `byPart`, `exportOverview`, `Bar` |
| `ProjectTab` | `components/projects/ProjectTab.jsx` | project state, BOM table, item form, `createPrj`, etc. |
| `WorkOrderTab` | `components/workorders/WorkOrderTab.jsx` | `projects`, navigation callbacks |

**Pattern:** Keep **state ownership** in `PickItApp` (or a context provider) at first; pass callbacks down. Later, optional **reducer** or **custom hooks** (`useTickets`, `useProjects`) can own updates.

### 3.7 Domain logic hooks (medium–high payoff)

Extract **before** or **while** splitting `DetailView`:

- **`useTicketActions`** — `submitTicket`, `advance`, `closeT`, `addComment`, `submitExcess`, `fireNS` (or a tiny `netsuiteClient.logBinTransfer` module).  
- **`useAnalyticsDerived`** — `released`, `bySite`, `byPart`, `grand`, `maxS`, `maxP` from `useMemo` inputs.  
- **`useProjectBom`** — `createPrj`, `saveItem`, `delItem`, `exportPrj`, work-order lock rules.

**Why:** Separates **rules** from **markup**; easier unit tests without `render`.

### 3.8 QR and CSV utilities (low risk)

- **`printQrTag`** — `src/lib/qr/printTicketTag.js` (depends on `ticketQrValue`, DOM).  
- **`csvExport`** — `src/lib/export/csv.js`.

---

## 4. Dependency order (practical migration)

1. Theme + `csvExport` + fixtures (no behavior change).  
2. Catalog + `PartSearch`.  
3. UI atoms (`Badge`, `Av`, `Bar`, …).  
4. Modals (each one).  
5. `Topbar`, `MRow`, `BoardView`, `ListView`.  
6. `DetailView` (largest; may split internal sections: header, line table, activity log, action bar).  
7. Analytics / project / work-order tabs.  
8. Introduce `useTicketActions` / context only when prop drilling becomes painful.

---

## 5. Anti-patterns to avoid during refactors

- **Copy-pasting `D` into every file** — centralize theme once; use CSS variables later if you migrate off inline styles.  
- **Splitting only by file without boundaries** — a “components” folder full of components that still import `INIT_TICKETS` from `App.jsx` worsens cycles; move data **out** first.  
- **Over-using Context for everything** — start with props; add context for `user`, `theme`, or `dispatch` only when multiple distant leaves need the same updates.

---

## 6. Filename convention

This document follows:

`docs/from.Corey/from.Corey.{YYYYMMDD}.{section}.{subSection}.md`

- **This file:** `from.Corey.20260507.app.separation-of-concerns.md`

---

## 7. Summary

`App.jsx` is a **single mega-component** (`PickItApp`) plus global constants. The biggest wins for separation of concerns are: **(1)** moving config/catalog/fixtures to `lib/` and `data/`, **(2)** extracting modals and main views into named components, **(3)** pulling ticket/project mutation logic into hooks or plain modules, and **(4)** keeping NetSuite and export side effects at the edges. The table in §3.6 is the intended end-state map for UI decomposition; §4 orders the work to limit merge pain.
