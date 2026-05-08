/**
 * Aggregate capability object — useful for passing into views or debugging ACL.
 */

import {
  canApproveTicket,
  canCreateProject,
  canPerformIcsActions,
  canUseDemoUserSwitcher,
  canUseInternalAssigneePickers,
  isViewHeavyExternalSession,
  shouldAutoApproveSubmission,
  shouldFilterTicketsByCompany,
} from "./permissions";
import type { PickitSession } from "./session";

export type PickitCapabilities = {
  canApproveTicket: boolean;
  canPerformIcsActions: boolean;
  canCreateProject: boolean;
  shouldAutoApproveSubmission: boolean;
  canUseInternalAssigneePickers: boolean;
  canUseDemoUserSwitcher: boolean;
  shouldFilterTicketsByCompany: boolean;
  isViewHeavyExternalSession: boolean;
};

export function getPickitCapabilities(
  session: PickitSession | null | undefined,
): PickitCapabilities {
  return {
    canApproveTicket: canApproveTicket(session),
    canPerformIcsActions: canPerformIcsActions(session),
    canCreateProject: canCreateProject(session),
    shouldAutoApproveSubmission: shouldAutoApproveSubmission(session),
    canUseInternalAssigneePickers: canUseInternalAssigneePickers(session),
    canUseDemoUserSwitcher: canUseDemoUserSwitcher(session),
    shouldFilterTicketsByCompany: shouldFilterTicketsByCompany(session),
    isViewHeavyExternalSession: isViewHeavyExternalSession(session),
  };
}
