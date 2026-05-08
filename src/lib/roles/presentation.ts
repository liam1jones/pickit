import { COREWEAVE_ROLE, type CoreWeaveRoleKey } from "./constants";

/**
 * Theme slice used for CoreWeave role pills / activity dots (matches `D` in App.jsx).
 */
export type RolePresentationTheme = {
  blue: string;
  green: string;
  teal: string;
  blueT: string;
  greenT: string;
  tealT: string;
};

export function getRoleColorMap(theme: RolePresentationTheme): Record<CoreWeaveRoleKey, string> {
  return {
    [COREWEAVE_ROLE.DCT]: theme.blueT,
    [COREWEAVE_ROLE.DCM_TIGER_TEAM]: theme.greenT,
    [COREWEAVE_ROLE.ICS]: theme.tealT,
  };
}

export function getRoleDotMap(theme: RolePresentationTheme): Record<CoreWeaveRoleKey, string> {
  return {
    [COREWEAVE_ROLE.DCT]: theme.blue,
    [COREWEAVE_ROLE.DCM_TIGER_TEAM]: theme.green,
    [COREWEAVE_ROLE.ICS]: theme.teal,
  };
}
