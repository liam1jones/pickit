/**
 * CoreWeave demo users for login, role switcher, and assignee pickers.
 * @see docs/fromCorey/fromCorey.20260507.users.mockData.md
 */

import type { CoreWeaveRoleKey } from "../roles/constants";

export type DemoUser = {
  name: string;
  email: string;
};

export type DemoUsersByRole = Record<CoreWeaveRoleKey, DemoUser[]>;

export const USERS: DemoUsersByRole = {
  DCT: [
    { name: "J. Torres", email: "jtorres@coreweave.com" },
    { name: "D. Kim", email: "dkim@coreweave.com" },
    { name: "A. Reyes", email: "areyes@coreweave.com" },
  ],
  "DCM / Tiger Team": [
    { name: "Graham Lawson", email: "glawson@coreweave.com" },
    { name: "Jesse Ball", email: "jball@coreweave.com" },
    { name: "Adam Razac", email: "arazac@coreweave.com" },
    { name: "Liam Jones (Admin)", email: "ljones@coreweave.com" },
  ],
  ICS: [
    { name: "Cole Megna", email: "cmegna@coreweave.com" },
    { name: "Frank D'Arrigo", email: "fdarrigo@coreweave.com" },
    { name: "Jesus Robles (RICM)", email: "jrobles@coreweave.com" },
    { name: "Matt Whittle (RICM)", email: "mwhittle@coreweave.com" },
    { name: "Rhys Lopez-Lloyd (RICM)", email: "rlopezlloyd@coreweave.com" },
  ],
};
