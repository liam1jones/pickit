# Componentizing mock CoreWeave users (`USERS`)

**Date (`date +%Y%m%d`):** `20260507`  
**Parent note:** [`from.Corey.20260507.app.separation-of-concerns.md`](from.Corey.20260507.app.separation-of-concerns.md) (§3.3 seed data, §3.1 theme)

This document plans how to **lift mock, hardcoded users** out of [`src/App.jsx`](../../src/App.jsx) into dedicated modules (and optionally thin UI wrappers), without changing runtime behavior until you flip imports.

---

## 1. Current state

### 1.1 `USERS` in `App.jsx` (line ~152)

Single object keyed by **role label** (must match app logic and `LoginScreen`):

| Key | Purpose |
|-----|---------|
| `DCT` | Data center techs — ticket requestors |
| `DCM / Tiger Team` | Approvers / leads |
| `ICS` | Inventory / staging contacts |

Each value is an array of `{ name, email }`. There is **no** `id` or `portal` field today; `LoginScreen` merges `role` when flattening entries.

### 1.2 Consumers (must keep working after move)

| Location | Usage |
|----------|--------|
| `App.jsx` — `Topbar` user menu | `Object.entries(USERS)` to list every person with role; `setUser({ name, role, email })` |
| `App.jsx` — `FormModal` | `USERS["ICS"]` and `USERS["DCM / Tiger Team"]` for `<select>` options (`value={u.name}`) |
| `App.jsx` — root `App` | `<LoginScreen users={USERS} theme={D} onLogin={…} />` |
| [`src/pages/LoginScreen.jsx`](../../src/pages/LoginScreen.jsx) | `useMemo` flattens `users` into `{ …u, role }[]` for CoreWeave portal email lookup |

**Contractor directory:** `LoginScreen.jsx` defines **`CONTRACTORS`** locally (separate from `USERS`). For consistency, treat it the same way: move to `src/data/mockContractors.js` (or shared `mockDirectory.js`) in the same pass or a follow-up PR.

---

## 2. Separation of concerns

| Concern | Owns |
|---------|------|
| **Data** | Static arrays / objects — no React |
| **Types** (optional) | `PickitUser`, `RoleKey`, `UserRecord` if you add TypeScript |
| **Presentation** | `LoginScreen`, Topbar — receive `users` prop or import from data module |
| **Auth / session** (later) | Replace mock module with API client; keep the same **shape** exported from a `getUsers()` or context until SSO lands |

Goal: **`App.jsx` does not define person rows**; it only wires state and passes props.

---

## 3. Proposed file layout

Pick one namespace and stay consistent:

### Option A — `src/data/` (recommended for fixtures)

```
src/data/
  mockCoreWeaveUsers.js    # export const MOCK_COREWAVE_USERS = { ... }
  mockContractors.js       # optional: move CONTRACTORS from LoginScreen
```

### Option B — `src/lib/auth/` (if you want “auth-shaped” naming)

```
src/lib/auth/
  mockUsers.js
```

**Exports (suggested names):**

- `MOCK_COREWAVE_USERS` — raw object (same shape as today’s `USERS`), **or**
- `USERS` — keep the name for minimal diff: `export const USERS = { … }` and `import { USERS } from "./data/mockCoreWeaveUsers.js"`

**Barrel (optional):** `src/data/index.js` re-exporting mock fixtures for one import path.

---

## 4. Type shape (optional, JS or TS)

If you introduce types (`.ts` or JSDoc), lock these in:

```ts
/** Keys must match role strings used in tickets and RBAC checks */
export type CoreWeaveRoleKey = "DCT" | "DCM / Tiger Team" | "ICS";

export type MockUserRecord = {
  name: string;
  email: string;
};

export type MockUsersByRole = Record<CoreWeaveRoleKey, MockUserRecord[]>;
```

**Do not** rename role strings without a repo-wide search (`canApprove`, `canClose`, `formAutoApprove`, `LoginScreen` portal logic).

---

## 5. Implementation checklist

1. **Create** `src/data/mockCoreWeaveUsers.js` and paste the current `USERS` literal from `App.jsx`.
2. **Add** `export const USERS = …` (or `MOCK_COREWAVE_USERS` + `export { MOCK_COREWAVE_USERS as USERS }`).
3. **In `App.jsx`:** `import { USERS } from "./data/mockCoreWeaveUsers.js";` and delete the inline `const USERS={…}`.
4. **Run** `npm run build` and smoke-test:
   - Login as each role via `LoginScreen` quick paths / email
   - Topbar “Switch role / user”
   - New ticket form: ICS and DCM dropdowns populate
5. **(Optional)** Move `CONTRACTORS` from `LoginScreen.jsx` to `src/data/mockContractors.js` and import there.

No component API change is **required** for step 1–4: `LoginScreen` already takes `users` as a prop.

---

## 6. Optional UI “componentization”

The parent SoC doc focuses on **files** and **logic**. For **users** specifically, you can add small presentational pieces without moving auth yet:

| Component | Responsibility |
|-----------|----------------|
| `UserRoleSection` | Given `role` + `users[]`, render a list row group (used by Topbar menu) |
| `UserSelectByRole` | `<select>` for `ICS` or `DCM / Tiger Team` with shared styling |

Pass **`users`** and **`theme`** as props so they stay testable. **Do not** import `USERS` inside these if you want storybook-style isolation — pass from parent.

---

## 7. Future: replacing mocks

When moving to real identity:

1. Implement `fetchCoreWeaveDirectory()` (or SSO callback) returning the **same** flattened or keyed shape.
2. Swap the import in `App.jsx` from static `USERS` to `useEffect` + state, or React Query, **or** keep static fallback behind `import.meta.env.DEV`.
3. Keep `LoginScreen`’s prop name `users` so the screen stays dumb.

---

## 8. Filename convention

`docs/from.Corey/from.Corey.{YYYYMMDD}.{section}.{subSection}.md`

| Part | Value |
|------|--------|
| YYYYMMDD | `20260507` |
| section | `users` |
| subSection | `mock-data` |

**This file:** `docs/from.Corey/from.Corey.20260507.users.mock-data.md`

---

## 9. Summary

Extract **`USERS`** to `src/data/mockCoreWeaveUsers.js` (or `lib/auth/mockUsers.js`) with a stable export name and shape. **`LoginScreen`** and **`App.jsx`** keep their current contracts (`users` prop, role keys). Optionally move **`CONTRACTORS`** the same way and add tiny select/list components later. This matches the parent document’s **§3.3 seed data** track and prepares a clean swap to directory APIs later.
