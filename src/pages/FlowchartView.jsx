/**
 * FlowchartView — a presentation-ready map of how PickIT works.
 *
 * Layout (top → bottom):
 *   1. Personas legend  ─ the five roles that touch the system
 *   2. Ticket lifecycle ─ SVG state machine (the 7 statuses + transitions)
 *   3. Integrations     ─ external systems PickIT talks to
 *   4. App surfaces     ─ where each role lives inside the UI
 *
 * Self-contained on purpose: only `theme` is required so the component can
 * be exported / screen-shared without pulling in app state.
 */

import { INTEGRATIONS } from "../lib/integrations";
import { STATUS_STYLE } from "../components/statusStyles";
import { ROLES } from "../lib/roles/roles";

const SURFACES = [
  { name: "Board view",     audience: "DCT, DCM",  what: "Kanban of tickets by status. Drag-friendly status columns." },
  { name: "List view",      audience: "All",       what: "Sortable / filterable table of every ticket with quick actions." },
  { name: "Detail view",    audience: "All",       what: "Single ticket with audit log, comments, QR tag, line-items, exports." },
  { name: "Analytics view", audience: "DCM, ICS",  what: "Overview KPIs · NSIM project tracker · Work-order list." },
  { name: "Flowchart view", audience: "All",       what: "This screen — how the system works, for onboarding & demos." },
];

// ── SVG geometry constants (centralized so it's easy to retune) ──────────────
const SVG = {
  W: 1000,
  H: 660,
  BOX: { w: 320, h: 44, rx: 8 },
  BRANCH_X: 700,
  MAIN_X: 280,
};

// One state node rendered inside the SVG.
function StateNode({ label, cx, cy, w = SVG.BOX.w, sc, n }) {
  const s = STATUS_STYLE[sc];
  const x = cx - w / 2;
  const y = cy - SVG.BOX.h / 2;
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={SVG.BOX.h} rx={SVG.BOX.rx}
        fill={s.bg} stroke={s.bd} strokeWidth="1"
      />
      {n != null && (
        <>
          <circle cx={x + 18} cy={cy} r={11} fill="rgba(255,255,255,0.06)" stroke={s.bd} strokeWidth="0.5" />
          <text x={x + 18} y={cy + 4} fontSize="10" fill={s.fg} textAnchor="middle" fontWeight="600">{n}</text>
        </>
      )}
      <text x={cx + 8} y={cy + 4} fontSize="12.5" fill={s.fg} textAnchor="middle" fontWeight="600">
        {label}
      </text>
    </g>
  );
}

// Inline label cluster for an arrow: a colored role-dot, the action text,
// and an optional NetSuite ⚡ side-effect line.
function ArrowLabel({ x, y, role, text, fx }) {
  const r = ROLES.find(rr => rr.key === role);
  const dot = r?.dot || "#9ca3af";
  const fg  = r?.fg  || "#cbd5e1";
  return (
    <g>
      <circle cx={x} cy={y - 2} r={3.5} fill={dot} />
      <text x={x + 9} y={y + 1} fontSize="11.5" fill={fg} fontWeight="500">{text}</text>
      {fx && (
        <text x={x + 9} y={y + 16} fontSize="10.5" fill="#fcd34d" fontWeight="500">
          ⚡ {fx}
        </text>
      )}
    </g>
  );
}

// Print stylesheet — injected once, scoped to the .pickit-flowchart-print
// wrapper so window.print() outputs a clean PDF of just this view with the
// dark theme intact. Hidden in normal screen rendering.
const PRINT_CSS = `
@media print {
  /* Force all background/foreground colors to render in print (Chrome/Safari) */
  *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  /* Hide everything by default, then re-show just the flowchart subtree. */
  body * { visibility: hidden !important; }
  .pickit-flowchart-print,
  .pickit-flowchart-print * { visibility: visible !important; }
  /* Re-anchor the flowchart to the page so it isn't offset by the hidden chrome. */
  .pickit-flowchart-print {
    position: absolute !important;
    inset: 0 !important;
    padding: 10mm !important;
    margin: 0 !important;
    max-width: none !important;
    background: #0f1117 !important;
    color: #e8eaf0 !important;
    overflow: visible !important;
  }
  /* Controls (button, hints) that shouldn't appear in the PDF. */
  .pickit-print-hide { display: none !important; }
  /* Try to keep each section/card together on one page when possible. */
  .pickit-print-section { break-inside: avoid; page-break-inside: avoid; }
  @page { margin: 0; }
}
`;

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function FlowchartView({ theme: D }) {
  const panel = {
    background: D.bg1,
    border: `0.5px solid ${D.border}`,
    borderRadius: 10,
    padding: 18,
  };
  const h2 = { fontSize: 13, fontWeight: 600, color: D.t1, letterSpacing: ".02em", margin: 0 };
  const sub = { fontSize: 11, color: D.t3, marginTop: 4 };

  // Triggers the browser's print preview; the user picks "Save as PDF"
  // as the destination in the dialog (default option on macOS + Chrome).
  const handleDownload = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div
      className="pickit-flowchart-print"
      style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1280, margin: "0 auto", width: "100%" }}
    >
      <style>{PRINT_CSS}</style>

      {/* ── Title strip ──────────────────────────────────────────────── */}
      <div className="pickit-print-section" style={{ ...panel, paddingTop: 22, paddingBottom: 22, display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 11, color: D.blueT, letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600 }}>
            PickIT · How it works
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: D.t1, marginTop: 6, letterSpacing: "-.01em" }}>
            Materials request lifecycle, end-to-end
          </div>
          <div style={{ fontSize: 12, color: D.t2, marginTop: 6, maxWidth: 820, lineHeight: 1.5 }}>
            A Data Center Tech requests parts → DCM / Tiger Team approves → ICS picks and stages → DCT
            confirms receipt and starts work → ICS closes the ticket (or processes the excess return).
            Every state change is auditable, and NetSuite bin transfers fire automatically on the two
            stock-movement transitions.
          </div>
        </div>
        <div className="pickit-print-hide" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <button
            onClick={handleDownload}
            style={{
              fontSize: 12, fontWeight: 500, letterSpacing: ".01em",
              padding: "8px 14px", borderRadius: 8, border: "none",
              background: D.blue, color: "#fff", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 7,
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.08)")}
            onMouseLeave={e => (e.currentTarget.style.filter = "")}
            title="Opens the print dialog — pick “Save as PDF” as the destination"
          >
            <DownloadIcon />
            Download PDF
          </button>
          <div style={{ fontSize: 10, color: D.t3, textAlign: "right", maxWidth: 180, lineHeight: 1.35 }}>
            Pick <span style={{ color: D.t2 }}>“Save as PDF”</span> in the print dialog
          </div>
        </div>
      </div>

      {/* ── Personas legend ──────────────────────────────────────────── */}
      <div className="pickit-print-section" style={panel}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={h2}>Who touches the system</h2>
          <div style={sub}>5 personas · 3 internal, 2 external</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 10 }}>
          {ROLES.map(r => (
            <div key={r.key} style={{ background: D.bg2, border: `0.5px solid ${D.border}`, borderRadius: 8, padding: "12px 12px 14px", borderTop: `2px solid ${r.dot}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.dot, display: "inline-block" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: r.fg }}>{r.label}</span>
              </div>
              <div style={{ fontSize: 11, color: D.t2, lineHeight: 1.45, marginBottom: 8 }}>{r.jtbd}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {r.actions.map(a => (
                  <li key={a} style={{ fontSize: 10.5, color: D.t3, paddingLeft: 10, position: "relative", lineHeight: 1.4 }}>
                    <span style={{ position: "absolute", left: 0, top: 6, width: 3, height: 3, borderRadius: "50%", background: D.t3 }} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Ticket-lifecycle state machine (the centerpiece) ─────────── */}
      <div className="pickit-print-section" style={panel}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={h2}>Ticket lifecycle · 7 states</h2>
          <div style={sub}>main path runs straight down · excess-return branches right</div>
        </div>

        <div style={{ background: D.bg0, border: `0.5px solid ${D.border}`, borderRadius: 8, padding: "14px 12px" }}>
          <svg viewBox={`0 0 ${SVG.W} ${SVG.H}`} width="100%" style={{ display: "block" }} role="img" aria-label="PickIT ticket state machine">

            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={D.t2} />
              </marker>
              <marker id="arrowAmber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fcd34d" />
              </marker>
            </defs>

            {/* state nodes — main column */}
            <StateNode n={1} label="Open / Submitted"            cx={SVG.MAIN_X} cy={40}  sc="Open / Submitted" />
            <StateNode n={2} label="Pending Approval"            cx={SVG.MAIN_X} cy={120} sc="Pending Approval" />
            <StateNode n={3} label="Approved – Pending Transfer" cx={SVG.MAIN_X} cy={200} sc="Approved – Pending Transfer" />
            <StateNode n={4} label="Picked / Staged"             cx={SVG.MAIN_X} cy={280} sc="Picked / Staged" />
            <StateNode n={5} label="In Progress – Work Underway" cx={SVG.MAIN_X} cy={380} sc="In Progress – Work Underway" />
            <StateNode n={7} label="Resolved / Closed"           cx={SVG.MAIN_X} cy={600} sc="Resolved / Closed" />

            {/* state node — excess branch */}
            <StateNode n={6} label="Excess Return Pending"       cx={SVG.BRANCH_X} cy={480} sc="Excess Return Pending" />

            {/* vertical arrows down the main column */}
            <line x1={SVG.MAIN_X} y1={62}  x2={SVG.MAIN_X} y2={94}  stroke={D.t2} strokeWidth="1.2" markerEnd="url(#arrow)" />
            <line x1={SVG.MAIN_X} y1={142} x2={SVG.MAIN_X} y2={174} stroke={D.t2} strokeWidth="1.2" markerEnd="url(#arrow)" />
            <line x1={SVG.MAIN_X} y1={222} x2={SVG.MAIN_X} y2={254} stroke={D.t2} strokeWidth="1.2" markerEnd="url(#arrow)" />
            <line x1={SVG.MAIN_X} y1={302} x2={SVG.MAIN_X} y2={354} stroke={D.t2} strokeWidth="1.2" markerEnd="url(#arrow)" />

            {/* IP-WU → fork → either straight down to Resolved, or right to Excess Return */}
            {/* straight-down: no-excess path */}
            <line x1={SVG.MAIN_X} y1={402} x2={SVG.MAIN_X} y2={574} stroke={D.t2} strokeWidth="1.2" markerEnd="url(#arrow)" />

            {/* branch right to Excess Return — start at right edge of IP-WU box */}
            <path
              d={`M ${SVG.MAIN_X + SVG.BOX.w / 2} 380 H ${SVG.BRANCH_X} V ${480 - 22}`}
              fill="none" stroke="#fcd34d" strokeWidth="1.2" strokeDasharray="5 3"
              markerEnd="url(#arrowAmber)"
            />

            {/* Excess Return → merge back into Resolved (enters R/C from its right edge) */}
            <path
              d={`M ${SVG.BRANCH_X} ${480 + 22} V 600 H ${SVG.MAIN_X + SVG.BOX.w / 2 + 2}`}
              fill="none" stroke="#fcd34d" strokeWidth="1.2" strokeDasharray="5 3"
              markerEnd="url(#arrowAmber)"
            />

            {/* transition labels (with optional ⚡ NetSuite side-effects) */}
            <ArrowLabel x={SVG.MAIN_X + 175} y={78}  role="DCT"  text="Auto-submit on intake" />
            <ArrowLabel x={SVG.MAIN_X + 175} y={158} role="DCM"  text="Approve" />
            <ArrowLabel x={SVG.MAIN_X + 175} y={238} role="ICS"  text="Pick & stage  (or QR scan)" />
            <ArrowLabel x={SVG.MAIN_X + 175} y={320} role="DCT"  text="Materials received" fx="NetSuite bin transfer: Stored → In Process" />
            <ArrowLabel x={SVG.MAIN_X + 175} y={490} role="ICS"  text="Close · no excess" />

            {/* branch labels — sit along the dashed branch / merge paths */}
            <text x={510} y={372} fontSize="11"   fill="#fcd34d" fontWeight="600">flag excess (ICS)</text>
            <text x={SVG.BRANCH_X + 14} y={540} fontSize="11"   fill="#fcd34d" fontWeight="500">Confirm return (ICS)</text>
            <text x={SVG.BRANCH_X + 14} y={556} fontSize="10.5" fill="#fcd34d" fontWeight="500">⚡ NetSuite: In Process → Stored</text>

            {/* footer note above Resolved */}
            <text x={SVG.MAIN_X} y={642} fontSize="10.5" fill={D.t3} textAnchor="middle" fontStyle="italic">
              Audit log + comments are appended at every transition · ticket is read-only after this point
            </text>
          </svg>
        </div>

        {/* role-key strip under the diagram */}
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", fontSize: 11, color: D.t2 }}>
          <span style={{ color: D.t3, fontWeight: 600 }}>Actor key:</span>
          {ROLES.slice(0, 3).map(r => (
            <span key={r.key} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.dot, display: "inline-block" }} />
              <span style={{ color: r.fg }}>{r.label}</span>
            </span>
          ))}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#fcd34d" }}>⚡</span>
            <span>NetSuite bin-transfer side-effect</span>
          </span>
        </div>
      </div>

      {/* ── External integrations ────────────────────────────────────── */}
      <div className="pickit-print-section" style={panel}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={h2}>External systems PickIT talks to</h2>
          <div style={sub}>each integration is owned by the pickit-svc backend (PRD §9)</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 }}>
          {INTEGRATIONS.map(it => (
            <div key={it.name} style={{ background: D.bg2, border: `0.5px solid ${D.border}`, borderRadius: 8, padding: "12px 14px", borderLeft: `2px solid ${it.color}` }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: D.t1 }}>{it.name}</div>
              <div style={{ fontSize: 10.5, color: it.color, marginTop: 2, marginBottom: 8, letterSpacing: ".02em" }}>{it.role}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                {it.notes.map(n => (
                  <li key={n} style={{ fontSize: 11, color: D.t2, paddingLeft: 10, position: "relative", lineHeight: 1.4 }}>
                    <span style={{ position: "absolute", left: 0, top: 7, width: 3, height: 3, borderRadius: "50%", background: it.color }} />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── App surfaces map ─────────────────────────────────────────── */}
      <div className="pickit-print-section" style={panel}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={h2}>What each tab in PickIT does</h2>
          <div style={sub}>top-bar views from left → right</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 10 }}>
          {SURFACES.map(s => (
            <div key={s.name} style={{ background: D.bg2, border: `0.5px solid ${D.border}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: D.t1 }}>{s.name}</div>
              <div style={{ fontSize: 10, color: D.t3, marginTop: 2, marginBottom: 8 }}>{s.audience}</div>
              <div style={{ fontSize: 11, color: D.t2, lineHeight: 1.45 }}>{s.what}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
