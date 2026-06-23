/**
 * Role and portal constants for PickIT (mock auth + future SSO).
 * @see docs/20260505.auth.loginPortals.md
 * @see docs/20260507.users.componentizationAcl.md
 * @see docs/fromCorey/fromCorey.20260507.users.mockData.md
 */

/** Login / session discriminator (LoginScreen `onLogin` payload). */
export const PORTAL = Object.freeze({
  COREWEAVE: "coreweave",
  CONTRACTOR: "contractor",
} as const);

export type PickitPortal = (typeof PORTAL)[keyof typeof PORTAL];

/** Canonical keys in the CoreWeave `USERS` fixture — do not rename without migrating seed tickets and logs. */
export const COREWEAVE_ROLE = Object.freeze({
  DCT: "DCT",
  DCM_TIGER_TEAM: "DCM / Tiger Team",
  ICS: "ICS",
} as const);

export type CoreWeaveRoleKey = (typeof COREWEAVE_ROLE)[keyof typeof COREWEAVE_ROLE];

/** Stable iteration order for UI (e.g. demo switcher, docs). */
export const COREWEAVE_ROLE_ORDER: readonly CoreWeaveRoleKey[] = Object.freeze([
  COREWEAVE_ROLE.DCT,
  COREWEAVE_ROLE.DCM_TIGER_TEAM,
  COREWEAVE_ROLE.ICS,
]);

/** Set-like lookup for CoreWeave role strings. */
export const COREWEAVE_ROLE_SET = new Set<string>(COREWEAVE_ROLE_ORDER);

/**
 * App-level `role` after contractor portal sign-in (`LoginScreen` sets `role: "Contractor"`).
 * Distinct from `contractorRole` (vendor job title).
 */
export const EXTERNAL_ROLE = Object.freeze({
  CONTRACTOR: "Contractor",
} as const);

export type ExternalAppRole = (typeof EXTERNAL_ROLE)[keyof typeof EXTERNAL_ROLE];

/**
 * Vendor job titles in the demo contractor directory — display / validation only; not ticket ACL keys.
 */
export const CONTRACTOR_JOB_TITLE = Object.freeze({
  FIELD_TECH: "Field Tech",
  PROJECT_MANAGER: "Project Manager",
  SITE_LEAD: "Site Lead",
} as const);

export type ContractorJobTitle =
  (typeof CONTRACTOR_JOB_TITLE)[keyof typeof CONTRACTOR_JOB_TITLE];

export const CONTRACTOR_JOB_TITLES: readonly ContractorJobTitle[] = Object.freeze(
  Object.values(CONTRACTOR_JOB_TITLE) as ContractorJobTitle[],
);
