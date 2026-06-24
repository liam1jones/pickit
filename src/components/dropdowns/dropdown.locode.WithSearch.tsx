import { useMemo, useRef, useState, type CSSProperties, type FocusEvent } from "react";
import { LOCODES } from "../../lib/cores/locations";
import type { InventoryTheme } from "../../lib/cores/inventory/theme";

export function locodeCodeFromLabel(label: string): string {
  return label.split(" ")[0];
}

export type LocodeWithSearchDropdownProps = {
  theme: InventoryTheme;
  value: string;
  onChange: (code: string) => void;
  label?: string;
  placeholder?: string;
  containerStyle?: CSSProperties;
};

export default function LocodeWithSearchDropdown({
  theme: D,
  value,
  onChange,
  label = "Site",
  placeholder = "Select a Locode…",
  containerStyle,
}: LocodeWithSearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(
    () => LOCODES.find((l) => locodeCodeFromLabel(l) === value),
    [value],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return LOCODES;
    return LOCODES.filter(
      (l) =>
        l.toLowerCase().includes(q) || locodeCodeFromLabel(l).toLowerCase().includes(q),
    );
  }, [query]);

  const inpS: CSSProperties = {
    fontSize: 12,
    padding: "7px 10px",
    borderRadius: 8,
    border: `0.5px solid ${D.border}`,
    background: D.bg2,
    color: D.t1,
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  };

  function select(code: string) {
    setQuery("");
    onChange(code);
    setOpen(false);
  }

  function handleBlur(e: FocusEvent) {
    if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 11, color: D.t3, marginBottom: 4 }}>{label}</div>
      <div ref={containerRef} style={{ position: "relative" }} onBlur={handleBlur}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            value={open ? query : selectedLabel ?? ""}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
              setQuery("");
            }}
            placeholder={placeholder}
            style={{ ...inpS, paddingRight: 28, cursor: "text" }}
          />
          {value && !open && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange("");
                setQuery("");
              }}
              tabIndex={-1}
              style={{
                position: "absolute",
                right: 6,
                background: "transparent",
                border: "none",
                color: D.t3,
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
                padding: 2,
              }}
            >
              ×
            </button>
          )}
          {!value && (
            <div
              style={{
                position: "absolute",
                right: 8,
                color: D.t3,
                fontSize: 10,
                pointerEvents: "none",
              }}
            >
              ▾
            </div>
          )}
        </div>
        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: D.bg1,
              border: `0.5px solid ${D.borderH}`,
              borderRadius: 8,
              zIndex: 500,
              maxHeight: 280,
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: "12px 12px", fontSize: 12, color: D.t3, textAlign: "center" }}>
                No locodes found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              filtered.map((l) => {
                const code = locodeCodeFromLabel(l);
                return (
                  <div
                    key={l}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      select(code);
                    }}
                    style={{
                      padding: "7px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "baseline",
                      gap: 10,
                      borderBottom: `0.5px solid ${D.border}`,
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
                        fontSize: 12,
                        fontWeight: 500,
                        color: D.blueT,
                        flexShrink: 0,
                        fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
                      }}
                    >
                      {code}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: D.t2,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={l}
                    >
                      {l.slice(code.length).replace(/^[–\s]+/, "")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
