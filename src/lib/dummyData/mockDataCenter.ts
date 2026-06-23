/** Demo ticket seed data for PickIT board / detail views. */

export type TicketLogEntry = {
  ts: string;
  who: string;
  role: string;
  action: string;
  detail: string;
};

export type TicketComment = {
  who: string;
  text: string;
};

export type TicketLine = {
  part: string;
  qtyReq: number;
  qtyIns: number | null;
  qtyRet: number | null;
};

/** Shape used by board/detail state in App.jsx (seed + runtime mutations). */
export type Ticket = {
  id: string;
  code: string;
  part: string;
  location: string;
  qtyReq: number;
  qtyIns: number | null;
  qtyRet: number | null;
  req: string;
  ics: string;
  status: string;
  date: string;
  comments: TicketComment[];
  asana: string;
  log: TicketLogEntry[];
  lines?: TicketLine[];
  projectId?: string | null;
  qrPayload?: string;
  dcm?: string | null;
  taskLink?: string;
};

export const mkD = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

export type ProjectItem = {
  id: string;
  partNumber: string;
  description: string;
  category: string;
  unit: string;
  qtyPlanned: number;
  qtyIns: number;
  qtyRet: number;
  notes: string;
};

/** Shape used by project BOM state in App.jsx (seed + runtime mutations). */
export type Project = {
  id: string;
  name: string;
  code: string;
  dataHall: string;
  subsidiary: string;
  description: string;
  createdAt: string;
  items: ProjectItem[];
  woNumber?: string;
  nsimRef?: string;
};

export const INIT_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "OBG01 DH2 Optics, Cables & Consumables",
    code: "US-OBG01",
    dataHall: "DH2",
    subsidiary: "CoreWeave, Inc",
    description: "NSIM intake – Orangeburg DH2 full rack deployment",
    createdAt: mkD(14),
    items: [
      {
        id: "i1",
        partNumber: "SFP-10G-SR",
        description: "10G SR Optic",
        category: "Optics",
        unit: "ea",
        qtyPlanned: 48,
        qtyIns: 40,
        qtyRet: 2,
        notes: "Phase 1 complete",
      },
      {
        id: "i2",
        partNumber: "DAC-10G-3M",
        description: "10G DAC Cable 3m",
        category: "Cables · Copper",
        unit: "ea",
        qtyPlanned: 96,
        qtyIns: 38,
        qtyRet: 2,
        notes: "",
      },
      {
        id: "i3",
        partNumber: "QSFP-40G-SR4",
        description: "40G SR4 QSFP",
        category: "Optics",
        unit: "ea",
        qtyPlanned: 24,
        qtyIns: 5,
        qtyRet: 1,
        notes: "Phase 2 pending",
      },
      {
        id: "i4",
        partNumber: "ISOPROPYL-1L",
        description: "Isopropyl Alcohol 1L",
        category: "Cleaners",
        unit: "bottle",
        qtyPlanned: 6,
        qtyIns: 4,
        qtyRet: 0,
        notes: "",
      },
      {
        id: "i5",
        partNumber: "FIBER-WIPE-100",
        description: "Fiber optic cleaning wipes",
        category: "Cleaners",
        unit: "pk",
        qtyPlanned: 200,
        qtyIns: 120,
        qtyRet: 0,
        notes: "",
      },
    ],
  },
];

export const mkL = (
  ts: string,
  who: string,
  role: string,
  action: string,
  detail = "",
): TicketLogEntry => ({ ts, who, role, action, detail });

const T0: Ticket = {
  id: "PICK-0042",
  code: "US-OBG01",
  part: "SFP-10G-SR",
  location: "DH2 – Rack C14",
  qtyReq: 4,
  qtyIns: 3,
  qtyRet: 1,
  req: "J. Torres",
  ics: "Cole Megna",
  status: "In Progress – Work Underway",
  date: mkD(0),
  comments: [{ who: "J. Torres (DCT)", text: "Materials received." }],
  asana: "task-8821",
  log: [
    mkL("09:01", "J. Torres", "DCT", "Ticket submitted", "SFP-10G-SR × 4 – DH2 Rack C14"),
    mkL("09:14", "Graham Lawson", "DCM / Tiger Team", "Ticket approved", "Status → Approved – Pending Transfer"),
    mkL("09:22", "Cole Megna", "ICS", "Picked / Staged", "Materials staged — DCT notified"),
    mkL("09:38", "J. Torres", "DCT", "Materials received & work begun", "NetSuite bin transfer fired — 4× SFP-10G-SR Stored → In Process"),
    mkL("10:05", "J. Torres", "DCT", "Comment added", "Materials received."),
  ],
};

const T1: Ticket = {
  id: "PICK-0041",
  code: "US-WJQ01",
  part: "PSU-1200W-AC",
  location: "DH3 – Rack F07",
  qtyReq: 2,
  qtyIns: null,
  qtyRet: null,
  req: "D. Kim",
  ics: "Frank D'Arrigo",
  status: "Pending Approval",
  date: mkD(0),
  comments: [],
  asana: "",
  log: [mkL("08:45", "D. Kim", "DCT", "Ticket submitted", "PSU-1200W-AC × 2 – DH3 Rack F07")],
};

const T2: Ticket = {
  id: "PICK-0040",
  code: "US-PPY01",
  part: "QSFP-40G-SR4",
  location: "DH4 – Rack D01",
  qtyReq: 1,
  qtyIns: null,
  qtyRet: null,
  req: "A. Reyes",
  ics: "Matt Whittle (RICM)",
  status: "Approved – Pending Transfer",
  date: mkD(1),
  comments: [],
  asana: "",
  log: [
    mkL("07:30", "A. Reyes", "DCT", "Ticket submitted", "QSFP-40G-SR4 × 1 – DH4 Rack D01"),
    mkL("07:52", "Jesse Ball", "DCM / Tiger Team", "Ticket approved", ""),
  ],
};

const T3: Ticket = {
  id: "PICK-0039",
  code: "US-LNS01",
  part: "CAT6A-3FT-BL",
  location: "DH2 – Rack B11",
  qtyReq: 12,
  qtyIns: 12,
  qtyRet: 0,
  req: "J. Torres",
  ics: "Jesus Robles (RICM)",
  status: "Resolved / Closed",
  date: mkD(1),
  comments: [],
  asana: "task-8819",
  log: [
    mkL("06:10", "J. Torres", "DCT", "Ticket submitted", "CAT6A-3FT-BL × 12"),
    mkL("06:22", "Adam Razac", "DCM / Tiger Team", "Ticket approved", ""),
    mkL("06:35", "Jesus Robles (RICM)", "ICS", "Picked / Staged", "Materials staged"),
    mkL("06:50", "J. Torres", "DCT", "Materials received & work begun", "NetSuite bin transfer fired — 12× CAT6A-3FT-BL Stored → In Process"),
    mkL("08:30", "Jesus Robles (RICM)", "ICS", "Ticket closed", "No excess — Resolved / Closed"),
  ],
};

const T4: Ticket = {
  id: "PICK-0038",
  code: "US-OBG01",
  part: "SFP-10G-SR",
  location: "DH1 – Rack A03",
  qtyReq: 8,
  qtyIns: 8,
  qtyRet: 0,
  req: "D. Kim",
  ics: "Cole Megna",
  status: "Resolved / Closed",
  date: mkD(2),
  comments: [],
  asana: "task-8810",
  log: [
    mkL("08:00", "D. Kim", "DCT", "Ticket submitted", "SFP-10G-SR × 8"),
    mkL("08:10", "Graham Lawson", "DCM / Tiger Team", "Ticket approved", ""),
    mkL("08:20", "Cole Megna", "ICS", "Picked / Staged", ""),
    mkL("08:35", "D. Kim", "DCT", "Materials received & work begun", "NetSuite bin transfer fired — 8× SFP-10G-SR Stored → In Process"),
    mkL("10:00", "Cole Megna", "ICS", "Ticket closed", "No excess"),
  ],
};

const T5: Ticket = {
  id: "PICK-0037",
  code: "US-OBG01",
  part: "QSFP-40G-SR4",
  location: "DH2 – Rack C06",
  qtyReq: 6,
  qtyIns: 5,
  qtyRet: 1,
  req: "J. Torres",
  ics: "Cole Megna",
  status: "Resolved / Closed",
  date: mkD(3),
  comments: [],
  asana: "task-8805",
  log: [
    mkL("07:00", "J. Torres", "DCT", "Ticket submitted", "QSFP-40G-SR4 × 6"),
    mkL("07:12", "Graham Lawson", "DCM / Tiger Team", "Ticket approved", ""),
    mkL("07:25", "Cole Megna", "ICS", "Picked / Staged", ""),
    mkL("07:40", "J. Torres", "DCT", "Materials received & work begun", "NetSuite bin transfer fired — 6× QSFP-40G-SR4 Stored → In Process"),
    mkL("09:00", "Cole Megna", "ICS", "Excess return flagged", "Used: 5 | Returned: 1 | NetSuite: 1 unit In Process → Stored"),
    mkL("09:15", "Cole Megna", "ICS", "Ticket closed", "Return confirmed"),
  ],
};

const T6: Ticket = {
  id: "PICK-0036",
  code: "US-PPY01",
  part: "SFP-10G-SR",
  location: "DH1 – Rack A09",
  qtyReq: 10,
  qtyIns: 10,
  qtyRet: 0,
  req: "A. Reyes",
  ics: "Matt Whittle (RICM)",
  status: "Resolved / Closed",
  date: mkD(3),
  comments: [],
  asana: "task-8803",
  log: [
    mkL("06:00", "A. Reyes", "DCT", "Ticket submitted", "SFP-10G-SR × 10"),
    mkL("06:15", "Jesse Ball", "DCM / Tiger Team", "Ticket approved", ""),
    mkL("06:30", "Matt Whittle (RICM)", "ICS", "Picked / Staged", ""),
    mkL("06:50", "A. Reyes", "DCT", "Materials received & work begun", "NetSuite bin transfer fired — 10× SFP-10G-SR Stored → In Process"),
    mkL("09:00", "Matt Whittle (RICM)", "ICS", "Ticket closed", "No excess"),
  ],
};

const T7: Ticket = {
  id: "PICK-0035",
  code: "US-HIO01",
  part: "SFP-10G-SR",
  location: "DH5 – Rack E01",
  qtyReq: 16,
  qtyIns: 16,
  qtyRet: 0,
  req: "J. Torres",
  ics: "Frank D'Arrigo",
  status: "Resolved / Closed",
  date: mkD(4),
  comments: [],
  asana: "task-8798",
  log: [
    mkL("07:00", "J. Torres", "DCT", "Ticket submitted", "SFP-10G-SR × 16"),
    mkL("07:20", "Adam Razac", "DCM / Tiger Team", "Ticket approved", ""),
    mkL("07:35", "Frank D'Arrigo", "ICS", "Picked / Staged", ""),
    mkL("07:55", "J. Torres", "DCT", "Materials received & work begun", "NetSuite bin transfer fired — 16× SFP-10G-SR Stored → In Process"),
    mkL("10:30", "Frank D'Arrigo", "ICS", "Ticket closed", "No excess"),
  ],
};

const T8: Ticket = {
  id: "PICK-0034",
  code: "US-LAS01",
  part: "SFP-10G-SR",
  location: "DH3 – Rack G02",
  qtyReq: 20,
  qtyIns: 18,
  qtyRet: 2,
  req: "A. Reyes",
  ics: "Rhys Lopez-Lloyd (RICM)",
  status: "Resolved / Closed",
  date: mkD(6),
  comments: [],
  asana: "task-8785",
  log: [
    mkL("06:00", "A. Reyes", "DCT", "Ticket submitted", "SFP-10G-SR × 20"),
    mkL("06:18", "Jesse Ball", "DCM / Tiger Team", "Ticket approved", ""),
    mkL("06:30", "Rhys Lopez-Lloyd (RICM)", "ICS", "Picked / Staged", ""),
    mkL("06:50", "A. Reyes", "DCT", "Materials received & work begun", "NetSuite bin transfer fired — 20× SFP-10G-SR Stored → In Process"),
    mkL("09:00", "Rhys Lopez-Lloyd (RICM)", "ICS", "Excess return flagged", "Used: 18 | Returned: 2"),
    mkL("09:20", "Rhys Lopez-Lloyd (RICM)", "ICS", "Ticket closed", "Return confirmed"),
  ],
};

const T9: Ticket = {
  id: "PICK-0033",
  code: "US-LAS01",
  part: "DAC-10G-3M",
  location: "DH3 – Rack G05",
  qtyReq: 30,
  qtyIns: 30,
  qtyRet: 0,
  req: "J. Torres",
  ics: "Rhys Lopez-Lloyd (RICM)",
  status: "Resolved / Closed",
  date: mkD(6),
  comments: [],
  asana: "task-8782",
  log: [
    mkL("07:00", "J. Torres", "DCT", "Ticket submitted", "DAC-10G-3M × 30"),
    mkL("07:15", "Graham Lawson", "DCM / Tiger Team", "Ticket approved", ""),
    mkL("07:30", "Rhys Lopez-Lloyd (RICM)", "ICS", "Picked / Staged", ""),
    mkL("07:50", "J. Torres", "DCT", "Materials received & work begun", "NetSuite bin transfer fired — 30× DAC-10G-3M Stored → In Process"),
    mkL("11:00", "Rhys Lopez-Lloyd (RICM)", "ICS", "Ticket closed", "No excess"),
  ],
};

export const INIT_TICKETS: Ticket[] = [T0, T1, T2, T3, T4, T5, T6, T7, T8, T9];
