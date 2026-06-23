/**
 * Ticket / project ACL — mirrors current PickItApp rules in App.jsx.
 * Extend here when contractor or IdP behavior diverges (see `docs/20260507.users.componentizationAcl.md` §7).
 */

import { COREWEAVE_ROLE, PORTAL } from "./constants";
import { getPortal, isContractorSession, isCoreWeaveSession, type PickitSession } from "./session";

export function canApproveTicket(session: PickitSession | null | undefined): boolean {
  return isCoreWeaveSession(session) && session.role === COREWEAVE_ROLE.DCM_TIGER_TEAM;
}

export function canPerformIcsActions(session: PickitSession | null | undefined): boolean {
  return isCoreWeaveSession(session) && session.role === COREWEAVE_ROLE.ICS;
}

export function canCreateProject(session: PickitSession | null | undefined): boolean {
  return isCoreWeaveSession(session) && session.role === COREWEAVE_ROLE.ICS;
}

export function shouldAutoApproveSubmission(session: PickitSession | null | undefined): boolean {
  return isCoreWeaveSession(session) && session.role === COREWEAVE_ROLE.DCM_TIGER_TEAM;
}

export function canUseInternalAssigneePickers(session: PickitSession | null | undefined): boolean {
  return isCoreWeaveSession(session);
}

export function canUseDemoUserSwitcher(session: PickitSession | null | undefined): boolean {
  return getPortal(session) === PORTAL.COREWEAVE;
}

// ── Planned / differentiated experience (docs §5–7) — safe defaults for callers to opt into ──

export function shouldFilterTicketsByCompany(session: PickitSession | null | undefined): boolean {
  return isContractorSession(session);
}

export function isViewHeavyExternalSession(session: PickitSession | null | undefined): boolean {
  return isContractorSession(session);
}
