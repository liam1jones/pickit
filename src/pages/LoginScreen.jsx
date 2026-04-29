import { useMemo, useState } from "react";
import coreweaveLogo from "../assets/coreweave-logo.png";

export default function LoginScreen({ users, theme, onLogin }) {
  const D = theme;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showQuick, setShowQuick] = useState(false);

  const flatUsers = useMemo(() => {
    const out = [];
    Object.entries(users).forEach(([role, list]) =>
      list.forEach((u) => out.push({ ...u, role })),
    );
    return out;
  }, [users]);

  function attempt(e) {
    e?.preventDefault?.();
    const target = email.trim().toLowerCase();
    if (!target) {
      setErr("Enter your CoreWeave email to continue.");
      return;
    }
    if (!password) {
      setErr("Enter a password.");
      return;
    }
    const match = flatUsers.find((u) => u.email.toLowerCase() === target);
    if (!match) {
      setErr("No PickIT account found for that email.");
      return;
    }
    setErr("");
    onLogin({ name: match.name, role: match.role, email: match.email });
  }

  function quickSignIn(u) {
    setErr("");
    onLogin({ name: u.name, role: u.role, email: u.email });
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

  return (
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
          maxWidth: 420,
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

        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: D.t1,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          Sign in to PickIT
        </div>
        <div
          style={{
            fontSize: 12,
            color: D.t3,
            marginBottom: 22,
            textAlign: "center",
          }}
        >
          Use your CoreWeave email to access the workspace.
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
            placeholder="you@coreweave.com"
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
              background: D.blue,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 500,
              letterSpacing: ".01em",
            }}
          >
            Sign in
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
            Quick demo sign-in
          </button>

          {showQuick && (
            <div style={{ marginTop: 10, maxHeight: 220, overflowY: "auto" }}>
              {flatUsers.map((u) => (
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
                      background: ROLE_DOT[u.role] || D.t3,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500 }}>{u.name}</div>
                    <div style={{ fontSize: 10, color: D.t3 }}>
                      {u.email} · {u.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
