import type { CSSProperties } from "react";
import coreweaveLogo from "../../assets/coreweave-logo.png";
import type { InventoryTheme } from "../../lib/cores/inventory/theme";

/** Top-bar view switcher (Board / List / Projects / Analytics / Flowchart). */
export const VIEWS = ["board", "list", "projects", "analytics", "flowchart"] as const;

export type TopBarView = (typeof VIEWS)[number];

export type TopBarUser = {
  name: string;
  role: string;
  email: string;
};

export type TopBarUsersByRole = Record<string, TopBarUser[]>;

export type TopBarNavProps = {
  view: string;
  onChange: (view: string) => void;
  theme: Pick<InventoryTheme, "border" | "bg3" | "t1" | "t2">;
  views?: readonly string[];
};

export type TopBarProps = {
  theme: InventoryTheme;
  view: string;
  onViewChange: (view: string) => void;
  user: TopBarUser;
  users: TopBarUsersByRole;
  showUserMenu: boolean;
  onToggleUserMenu: () => void;
  onSelectUser: (user: TopBarUser & { role: string }) => void;
  onLogout?: () => void;
  onNewTicket: () => void;
  fSite: string;
  onFSiteChange: (site: string) => void;
  fStat: string;
  onFStatChange: (status: string) => void;
  locodes: readonly string[];
  statuses: readonly string[];
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Avatar({
  name,
  bg,
  fg,
}: {
  name: string;
  bg: string;
  fg: string;
}) {
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()}
    </div>
  );
}

export function TopBarNav({
  view,
  onChange,
  theme: D,
  views = VIEWS,
}: TopBarNavProps) {
  return (
    <>
      <div style={{ width: "0.5px", height: 14, background: D.border }} />
      {views.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          style={{
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 6,
            border: "none",
            background: view === v ? D.bg3 : "transparent",
            color: view === v ? D.t1 : D.t2,
            cursor: "pointer",
            fontWeight: view === v ? 500 : 400,
          }}
        >
          {cap(v)}
        </button>
      ))}
    </>
  );
}

export default function TopBar({
  theme: D,
  view,
  onViewChange,
  user,
  users,
  showUserMenu,
  onToggleUserMenu,
  onSelectUser,
  onLogout,
  onNewTicket,
  fSite,
  onFSiteChange,
  fStat,
  onFStatChange,
  locodes,
  statuses,
}: TopBarProps) {
  const selectStyle: CSSProperties = {
    fontSize: 12,
    padding: "7px 10px",
    borderRadius: 8,
    border: `0.5px solid ${D.border}`,
    background: D.bg2,
    color: D.t1,
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
    cursor: "pointer",
  };

  return (
    <div style={{ background: D.bg1, borderBottom: `0.5px solid ${D.border}` }}>
      <div
        style={{
          padding: "10px 16px",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifySelf: "start" }}>
          <div style={{ fontWeight: 500, fontSize: 13, color: D.blue, letterSpacing: ".05em" }}>
            PICK
          </div>
          <TopBarNav view={view} onChange={onViewChange} theme={D} />
        </div>
        <div
          style={{
            justifySelf: "center",
            display: "flex",
            alignItems: "center",
            gap: 12,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: D.t1,
              letterSpacing: "-.01em",
              fontFamily: "'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif",
            }}
          >
            Pick<span style={{ color: "#1E40F6" }}>IT</span>
          </span>
          <span style={{ fontSize: 11, color: D.t3 }}>powered by</span>
          <img
            src={coreweaveLogo}
            alt="CoreWeave"
            style={{ height: 32, width: "auto", display: "block", transform: "translateY(-3px)" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifySelf: "end" }}>
          <div style={{ position: "relative" }}>
            <div
              onClick={onToggleUserMenu}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: 8,
                border: `0.5px solid ${D.border}`,
                background: D.bg2,
              }}
            >
              <Avatar name={user.name} bg={D.blueB} fg={D.blueT} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: D.t1 }}>
                  {user.name.split(" ").slice(0, 2).join(" ")}
                </div>
                <div style={{ fontSize: 10, color: D.t3 }}>{user.role}</div>
              </div>
            </div>
            {showUserMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 4px)",
                  background: D.bg1,
                  border: `0.5px solid ${D.border}`,
                  borderRadius: 10,
                  zIndex: 99,
                  minWidth: 230,
                  padding: 8,
                }}
              >
                <div style={{ fontSize: 10, color: D.t3, padding: "4px 8px 6px" }}>
                  Switch role / user
                </div>
                {Object.entries(users).map(([role, us]) =>
                  us.map((u) => (
                    <div
                      key={u.email}
                      onClick={() => onSelectUser({ ...u, role })}
                      style={{
                        padding: "7px 8px",
                        fontSize: 12,
                        cursor: "pointer",
                        borderRadius: 6,
                        background: user.email === u.email ? D.bg3 : "transparent",
                        color: D.t1,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Avatar name={u.name} bg={D.purpleB} fg={D.purpleT} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{u.name}</div>
                        <div style={{ fontSize: 10, color: D.t3 }}>{role}</div>
                      </div>
                    </div>
                  )),
                )}
                <div style={{ height: "0.5px", background: D.border, margin: "6px 0" }} />
                <div
                  onClick={() => {
                    if (showUserMenu) onToggleUserMenu();
                    onLogout?.();
                  }}
                  style={{
                    padding: "7px 8px",
                    fontSize: 12,
                    cursor: "pointer",
                    borderRadius: 6,
                    color: D.redT,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = D.bg3;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: D.redB,
                      color: D.redT,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ↩
                  </span>
                  <div>
                    <div style={{ fontWeight: 500 }}>Sign out</div>
                    <div style={{ fontSize: 10, color: D.t3 }}>{user.email}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onNewTicket}
            style={{
              fontSize: 13,
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              background: D.blue,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 500,
              letterSpacing: ".01em",
            }}
          >
            + New ticket
          </button>
        </div>
      </div>
      {(view === "board" || view === "list") && (
        <div
          style={{
            padding: "6px 16px 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderTop: `0.5px solid ${D.border}`,
          }}
        >
          <span style={{ fontSize: 11, color: D.t3, marginRight: 4 }}>Filter:</span>
          <select
            value={fSite}
            onChange={(e) => onFSiteChange(e.target.value)}
            style={{ ...selectStyle, maxWidth: 160, fontSize: 11, padding: "4px 8px" }}
          >
            <option value="">All sites</option>
            {locodes.map((l) => (
              <option key={l} value={l.split(" ")[0]}>
                {l.split(" ")[0]}
              </option>
            ))}
          </select>
          <select
            value={fStat}
            onChange={(e) => onFStatChange(e.target.value)}
            style={{ ...selectStyle, fontSize: 11, padding: "4px 8px", maxWidth: 220 }}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {(fSite || fStat) && (
            <button
              type="button"
              onClick={() => {
                onFSiteChange("");
                onFStatChange("");
              }}
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 6,
                border: `0.5px solid ${D.border}`,
                background: "transparent",
                color: D.t3,
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
