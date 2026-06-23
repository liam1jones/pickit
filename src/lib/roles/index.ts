/**
 * PickIT roles, portals, session helpers, and ACL.
 * @see docs/20260507.users.componentizationAcl.md
 */

export {
  CONTRACTOR_JOB_TITLE,
  CONTRACTOR_JOB_TITLES,
  COREWEAVE_ROLE,
  COREWEAVE_ROLE_ORDER,
  COREWEAVE_ROLE_SET,
  EXTERNAL_ROLE,
  PORTAL,
  type ContractorJobTitle,
  type CoreWeaveRoleKey,
  type ExternalAppRole,
  type PickitPortal,
} from "./constants";

export { getPickitCapabilities, type PickitCapabilities } from "./capabilities";

export {
  canApproveTicket,
  canCreateProject,
  canPerformIcsActions,
  canUseDemoUserSwitcher,
  canUseInternalAssigneePickers,
  isViewHeavyExternalSession,
  shouldAutoApproveSubmission,
  shouldFilterTicketsByCompany,
} from "./permissions";

export {
  getPortal,
  isContractorSession,
  isCoreWeaveRoleKey,
  isCoreWeaveSession,
  type PickitSession,
  type PickitSessionContractor,
  type PickitSessionCoreWeave,
} from "./session";

export {
  getRoleColorMap,
  getRoleDotMap,
  type RolePresentationTheme,
} from "./presentation";

export { ROLES, type FlowchartRole, type FlowchartRoleKey } from "./roles";
