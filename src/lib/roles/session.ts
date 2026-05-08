/**
 * Session shape helpers — portal inference and contractor detection.
 * @see docs/20260505.auth.loginPortals.md — §3 session payload
 */

import {
  COREWEAVE_ROLE_SET,
  EXTERNAL_ROLE,
  PORTAL,
  type CoreWeaveRoleKey,
  type PickitPortal,
} from "./constants";

export type PickitSessionCoreWeave = {
  portal?: typeof PORTAL.COREWEAVE;
  name: string;
  role: CoreWeaveRoleKey;
  email: string;
};

export type PickitSessionContractor = {
  portal?: typeof PORTAL.CONTRACTOR;
  name: string;
  role: typeof EXTERNAL_ROLE.CONTRACTOR;
  contractorRole: string;
  company: string;
  email: string;
};

export type PickitSession = PickitSessionCoreWeave | PickitSessionContractor;

export function isContractorSession(
  session: PickitSession | null | undefined,
): session is PickitSessionContractor {
  if (!session) return false;
  if (session.portal === PORTAL.CONTRACTOR) return true;
  return session.role === EXTERNAL_ROLE.CONTRACTOR;
}

export function isCoreWeaveSession(
  session: PickitSession | null | undefined,
): session is PickitSessionCoreWeave {
  if (!session) return false;
  return !isContractorSession(session);
}

/**
 * Normalized portal for ACL — tolerates legacy objects that only set `role`.
 */
export function getPortal(session: PickitSession | null | undefined): PickitPortal {
  if (!session) return PORTAL.COREWEAVE;
  if (session.portal === PORTAL.CONTRACTOR || session.portal === PORTAL.COREWEAVE) {
    return session.portal;
  }
  if (session.role === EXTERNAL_ROLE.CONTRACTOR) return PORTAL.CONTRACTOR;
  if (COREWEAVE_ROLE_SET.has(session.role)) return PORTAL.COREWEAVE;
  return PORTAL.COREWEAVE;
}

export function isCoreWeaveRoleKey(role: string | undefined): role is CoreWeaveRoleKey {
  return typeof role === "string" && COREWEAVE_ROLE_SET.has(role);
}
