import { useMemo, useState } from "react";
import coreweaveLogo from "../assets/coreweave-logo.png";

// Demo contractor directory. In production this would come from an SSO/IdP
// or your contractor onboarding system.
const CONTRACTORS = [
  { name: "Sam Patel",     email: "spatel@lumaoptics.com",  company: "Luma Optics", role: "Field Tech" },
  { name: "Priya Shah",    email: "pshah@lumaoptics.com",   company: "Luma Optics", role: "Project Manager" },
  { name: "Marcus Lee",    email: "mlee@proficium.com",     company: "Proficium",   role: "Field Tech" },
  { name: "Olivia Park",   email: "opark@cconnex.com",      company: "C-Connex",    role: "Site Lead" },
  { name: "Diego Alvarez", email: "dalvarez@flexoptix.com", company: "Flexoptix",   role: "Field Tech" },
  { name: "Hannah Wu",     email: "hwu@siemon.com",         company: "Siemon",      role: "Project Manager" },
];

const PORTALS = {
  coreweave: {
    label: "CoreWeave",
    sub: "Internal team — DCT, DCM / Tiger Team, ICS",
    accent: "#1E40F6",
    accentSoft: "rgba(30,64,246,0.12)",
    icon: "CW",
  },
  contractor: {
    label: "Contractor",
    sub: "Vendor & partner field teams",
    accent: "#f59e0b",
    accentSoft: "rgba(245,158,11,0.14)",
    icon: "CT",
  },
};

export default function LoginScreen({ users, theme, onLogin }) {
  const D = theme;
  const [portal, setPortal] = useState(null); // null | "coreweave" | "contractor"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showQuick, setShowQuick] = useState(false);

  const flatCwUsers = useMemo(() => {
    const out = [];
    Object.entries(users).forEach(([role, list]) =>
      list.forEach((u) => out.push({ ...u, role })),
    );
    return out;
  }, [users]);

  function resetForm() {
    setEmail("");
    setPassword("");
    setErr("");
    setShowQuick(false);
  }

  function backToChooser() {
    resetForm();
    setPortal(null);
  }

  function attempt(e) {
    e?.preventDefault?.();
    const target = email.trim().toLowerCase();
    if (!target) {
      setErr("Enter your email to continue.");
      return;
    }
    if (!password) {
      setErr("Enter a password.");
      return;
    }
    if (portal === "coreweave") {
      const match = flatCwUsers.find((u) => u.email.toLowerCase() === target);
      if (!match) {
        setErr("No CoreWeave account found for that email.");
        return;
      }
      setErr("");
      onLogin({
        portal: "coreweave",
        name: match.name,
        role: match.role,
        email: match.email,
      });
      return;
    }
    if (portal === "contractor") {
      const match = CONTRACTORS.find((c) => c.email.toLowerCase() === target);
      if (!match) {
        setErr("No contractor account found for that email.");
        return;
      }
      setErr("");
      onLogin({
        portal: "contractor",
        name: match.name,
        role: "Contractor",
        contractorRole: match.role,
        company: match.company,
        email: match.email,
      });
    }
  }

  function quickSignIn(u) {
    setErr("");
    if (portal === "coreweave") {
      onLogin({
        portal: "coreweave",
        name: u.name,
        role: u.role,
        email: u.email,
      });
    } else {
      onLogin({
        portal: "contractor",
        name: u.name,
        role: "Contractor",
        contractorRole: u.role,
        company: u.company,
        email: u.email,
      });
    }
  }

  const inpS = {
    fontSize: 13,
    padding: "10px 12px",
    borderRadius: 8,
    border: `0.5px solid ${D.border}`,
    background: D.bg2,
    color: D.t1,
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  };

  const ROLE_DOT = {
    DCT: D.blue,
    "DCM / Tiger Team": D.green,
    ICS: D.teal,
  };

  // Page wrapper (logo + branded card)
  const PageShell = ({ children, maxWidth = 440 }) => (
    <div
      style={{
        minHeight: "100vh",
        background: D.bg0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "system-ui,-apple-system,'Segoe UI',sans-serif",
        color: D.t1,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth,
          background: D.bg1,
          border: `0.5px solid ${D.border}`,
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: D.t1,
              letterSpacing: "-.01em",
              fontFamily:
                "'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif",
            }}
          >
            Pick<span style={{ color: "#1E40F6" }}>IT</span>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 11, color: D.t3 }}>powered by</span>
          <img
            src={coreweaveLogo}
            alt="CoreWeave"
            style={{ height: 28, width: "auto", display: "block" }}
          />
        </div>
        {children}
      </div>
    </div>
  );

  // ── Step 1: portal chooser ────────────────────────────────────────────────
  if (!portal) {
    return (
      <PageShell maxWidth={520}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: D.t1,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          Choose your portal
        </div>
        <div
          style={{
            fontSize: 12,
            color: D.t3,
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Select how you want to sign in to PickIT.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {Object.entries(PORTALS).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPortal(key)}
              style={{
                background: D.bg2,
                border: `0.5px solid ${D.border}`,
                borderRadius: 12,
                padding: "20px 16px",
                cursor: "pointer",
                textAlign: "left",
                color: D.t1,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                transition: "border-color 120ms, background 120ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = p.accent;
                e.currentTarget.style.background = D.bg3;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = D.border;
                e.currentTarget.style.background = D.bg2;
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: p.accentSoft,
                  border: `0.5px solid ${p.accent}`,
                  color: p.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: ".02em",
                }}
              >
                {p.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 2,
                    color: D.t1,
                  }}
                >
                  {p.label}
                </div>
                <div style={{ fontSize: 11, color: D.t3, lineHeight: 1.4 }}>
                  {p.sub}
                </div>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: p.accent,
                  marginTop: "auto",
                  fontWeight: 500,
                }}
              >
                Continue →
              </div>
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 22,
            fontSize: 10,
            color: D.t3,
            textAlign: "center",
          }}
        >
          Need access? Contact your CoreWeave program manager.
        </div>
      </PageShell>
    );
  }

  // ── Step 2: sign-in form for chosen portal ────────────────────────────────
  const cfg = PORTALS[portal];
  const isCw = portal === "coreweave";
  const quickList = isCw ? flatCwUsers : CONTRACTORS;

  return (
    <PageShell>
      <button
        type="button"
        onClick={backToChooser}
        style={{
          background: "transparent",
          border: "none",
          color: D.t2,
          fontSize: 11,
          cursor: "pointer",
          padding: 0,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        ← Choose a different portal
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: cfg.accentSoft,
            border: `0.5px solid ${cfg.accent}`,
            color: cfg.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 11,
          }}
        >
          {cfg.icon}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: D.t1 }}>
            {cfg.label} portal
          </div>
          <div style={{ fontSize: 11, color: D.t3 }}>{cfg.sub}</div>
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          color: D.t3,
          margin: "16px 0 18px",
        }}
      >
        {isCw
          ? "Sign in with your CoreWeave email."
          : "Sign in with the email your CoreWeave program manager registered."}
      </div>

      <form onSubmit={attempt}>
        <label
          style={{
            fontSize: 11,
            color: D.t2,
            display: "block",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          Email
        </label>
        <input
          type="email"
          autoFocus
          placeholder={isCw ? "you@coreweave.com" : "you@vendor.com"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ ...inpS, marginBottom: 14 }}
        />

        <label
          style={{
            fontSize: 11,
            color: D.t2,
            display: "block",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...inpS, marginBottom: 6 }}
        />

        {err && (
          <div
            style={{
              fontSize: 11,
              color: D.redT,
              background: D.redB,
              border: `0.5px solid ${D.red}`,
              padding: "7px 10px",
              borderRadius: 6,
              marginTop: 10,
              marginBottom: 4,
            }}
          >
            {err}
          </div>
        )}

        <button
          type="submit"
          style={{
            marginTop: 18,
            width: "100%",
            fontSize: 13,
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: cfg.accent,
            color: "#fff",
            cursor: "pointer",
            fontWeight: 500,
            letterSpacing: ".01em",
          }}
        >
          Sign in to {cfg.label}
        </button>
      </form>

      <div
        style={{
          marginTop: 22,
          paddingTop: 16,
          borderTop: `0.5px solid ${D.border}`,
        }}
      >
        <button
          type="button"
          onClick={() => setShowQuick((v) => !v)}
          style={{
            background: "transparent",
            border: "none",
            color: D.t2,
            fontSize: 11,
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>{showQuick ? "▾" : "▸"}</span>
          Quick demo sign-in ({quickList.length})
        </button>

        {showQuick && (
          <div style={{ marginTop: 10, maxHeight: 240, overflowY: "auto" }}>
            {quickList.map((u) => (
              <div
                key={u.email}
                onClick={() => quickSignIn(u)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 12,
                  color: D.t1,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = D.bg3)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: isCw
                      ? ROLE_DOT[u.role] || D.t3
                      : cfg.accent,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{u.name}</div>
                  <div style={{ fontSize: 10, color: D.t3 }}>
                    {u.email} ·{" "}
                    {isCw ? u.role : `${u.company} — ${u.role}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
