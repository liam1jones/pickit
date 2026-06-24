import { useMemo, type ComponentType, type CSSProperties } from "react";
import LocodeWithSearchDropdown from "../dropdowns/dropdown.locode.WithSearch";
import type { DemoUser } from "../../lib/dummyData/demoUsers";
import { getLocationByCode, parseIcsContacts } from "../../lib/cores/locations";
import type { InventoryTheme } from "../../lib/cores/inventory/theme";

export type TicketFormLine = {
  id: number;
  part: string;
  qty: string;
};

export type TicketFormState = {
  site: string;
  dataHall: string;
  rack: string;
  ru: string;
  ics: string;
  dcm: string;
  taskLink: string;
  lines: TicketFormLine[];
};

export const EMPTY_TICKET_FORM: TicketFormState = {
  site: "",
  dataHall: "",
  rack: "",
  ru: "",
  ics: "",
  dcm: "",
  taskLink: "",
  lines: [{ id: 1, part: "", qty: "" }],
};

export type PartSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export type NewTicketModalProps = {
  open: boolean;
  theme: InventoryTheme;
  form: TicketFormState;
  onFormChange: (updater: (form: TicketFormState) => TicketFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
  formAutoApprove: boolean;
  dcmUsers: readonly DemoUser[];
  PartSearch: ComponentType<PartSearchProps>;
};

function formStyles(theme: InventoryTheme) {
  const inpS: CSSProperties = {
    fontSize: 12,
    padding: "7px 10px",
    borderRadius: 8,
    border: `0.5px solid ${theme.border}`,
    background: theme.bg2,
    color: theme.t1,
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  };
  const selS: CSSProperties = { ...inpS, cursor: "pointer" };
  const btnS: CSSProperties = {
    fontSize: 12,
    padding: "6px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
  };
  return { inpS, selS, btnS };
}

function validateTicketForm(form: TicketFormState) {
  const validLineCount = form.lines.filter(
    (l) => l.part.trim() && parseInt(l.qty, 10) > 0,
  ).length;
  const missingFields: string[] = [];
  if (!form.site) missingFields.push("Site");
  if (!form.dataHall) missingFields.push("Data Hall");
  if (!form.rack) missingFields.push("Rack");
  if (!form.ics) missingFields.push("Onsite ICS");
  if (validLineCount === 0) missingFields.push("at least one part & qty");
  return {
    validLineCount,
    missingFields,
    formValid: missingFields.length === 0,
  };
}

export default function NewTicketModal({
  open,
  theme: D,
  form,
  onFormChange,
  onClose,
  onSubmit,
  formAutoApprove,
  dcmUsers,
  PartSearch,
}: NewTicketModalProps) {
  const siteIcsOptions = useMemo(
    () => parseIcsContacts(getLocationByCode(form.site)?.ics ?? ""),
    [form.site],
  );

  if (!open) return null;

  const { inpS, selS, btnS } = formStyles(D);
  const { validLineCount, missingFields, formValid } = validateTicketForm(form);

  function handleSiteChange(site: string) {
    const icsOptions = parseIcsContacts(getLocationByCode(site)?.ics ?? "");
    onFormChange((f) => ({
      ...f,
      site,
      ics:
        icsOptions.length === 1
          ? icsOptions[0]
          : icsOptions.includes(f.ics)
            ? f.ics
            : "",
    }));
  }

  function addLine() {
    const nextId = Math.max(0, ...form.lines.map((l) => l.id)) + 1;
    onFormChange((f) => ({
      ...f,
      lines: [...f.lines, { id: nextId, part: "", qty: "" }],
    }));
  }

  function removeLine(id: number) {
    onFormChange((f) => ({ ...f, lines: f.lines.filter((l) => l.id !== id) }));
  }

  function updateLine(id: number, field: "part" | "qty", val: string) {
    onFormChange((f) => ({
      ...f,
      lines: f.lines.map((l) => (l.id === id ? { ...l, [field]: val } : l)),
    }));
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
    >
      <div
        style={{
          background: D.bg1,
          borderRadius: 12,
          border: `0.5px solid ${D.border}`,
          padding: 24,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500, color: D.t1, marginBottom: 4 }}>
          New pick ticket
        </div>
        <div style={{ fontSize: 11, color: D.t3, marginBottom: 16 }}>
          Shared fields apply to all line items below.
        </div>

        {formAutoApprove && (
          <div
            style={{
              background: D.greenB,
              border: `0.5px solid ${D.green}`,
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 14,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: D.green,
                flexShrink: 0,
                marginTop: 5,
              }}
            />
            <div style={{ fontSize: 11, color: D.greenT, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Auto-approval enabled</div>
              <div style={{ color: D.t2 }}>
                As a DCM / Tiger Team Lead, your tickets skip approval. The selected{" "}
                <span style={{ color: D.greenT, fontWeight: 500 }}>Onsite ICS</span> will be
                notified immediately to pick &amp; stage.
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <LocodeWithSearchDropdown
            theme={D}
            value={form.site}
            onChange={handleSiteChange}
            containerStyle={{ gridColumn: "1/-1" }}
          />
          <div
            style={{
              gridColumn: "1/-1",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: D.t3, marginBottom: 4 }}>Data Hall</div>
              <input
                value={form.dataHall}
                onChange={(e) => onFormChange((f) => ({ ...f, dataHall: e.target.value }))}
                placeholder="e.g. DH3"
                style={inpS}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: D.t3, marginBottom: 4 }}>Rack</div>
              <input
                value={form.rack}
                onChange={(e) => onFormChange((f) => ({ ...f, rack: e.target.value }))}
                placeholder="e.g. B07"
                style={inpS}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: D.t3, marginBottom: 4 }}>
                RU <span style={{ fontSize: 10, color: D.t3, fontWeight: 400 }}>(optional)</span>
              </div>
              <input
                value={form.ru}
                onChange={(e) => onFormChange((f) => ({ ...f, ru: e.target.value }))}
                placeholder="e.g. U12"
                style={inpS}
              />
            </div>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <div style={{ fontSize: 11, color: D.t3, marginBottom: 4 }}>Onsite ICS</div>
            {!form.site ? (
              <select disabled style={{ ...selS, color: D.t3, cursor: "not-allowed" }}>
                <option>Select a site first…</option>
              </select>
            ) : siteIcsOptions.length === 0 ? (
              <select disabled style={{ ...selS, color: D.t3, cursor: "not-allowed" }}>
                <option>No ICS on file for this site</option>
              </select>
            ) : siteIcsOptions.length === 1 ? (
              <input readOnly value={siteIcsOptions[0]} style={{ ...inpS, color: D.t2, cursor: "default" }} />
            ) : (
              <select
                value={form.ics}
                onChange={(e) => onFormChange((f) => ({ ...f, ics: e.target.value }))}
                style={selS}
              >
                <option value="">Select ICS…</option>
                {siteIcsOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <div style={{ fontSize: 11, color: D.t3, marginBottom: 4 }}>
              DCM / Tiger Team Lead{" "}
              <span style={{ fontSize: 10, color: D.t3, fontWeight: 400 }}>(optional)</span>
            </div>
            <select
              value={form.dcm}
              onChange={(e) => onFormChange((f) => ({ ...f, dcm: e.target.value }))}
              style={selS}
            >
              <option value="">Select DCM / Tiger Team Lead…</option>
              {dcmUsers.map((u) => (
                <option key={u.email} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <div style={{ fontSize: 11, color: D.t3, marginBottom: 4 }}>
              Jira / Asana Task Link{" "}
              <span style={{ fontSize: 10, color: D.t3, fontWeight: 400 }}>(optional)</span>
            </div>
            <input
              value={form.taskLink}
              onChange={(e) => onFormChange((f) => ({ ...f, taskLink: e.target.value }))}
              placeholder="https://app.asana.com/... or https://coreweave.atlassian.net/..."
              style={inpS}
            />
          </div>
        </div>

        <div style={{ borderTop: `0.5px solid ${D.border}`, paddingTop: 14, marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 500, color: D.t2 }}>Parts &amp; quantities</div>
            <div style={{ fontSize: 10, color: D.t3 }}>
              {form.lines.length} line{form.lines.length !== 1 ? "s" : ""} · {validLineCount} valid
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 28px",
              gap: 6,
              marginBottom: 6,
              paddingLeft: 2,
            }}
          >
            <div style={{ fontSize: 10, color: D.t3 }}>Part number</div>
            <div style={{ fontSize: 10, color: D.t3 }}>Qty</div>
            <div />
          </div>

          {form.lines.map((line) => (
            <div
              key={line.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 28px",
                gap: 6,
                marginBottom: 6,
                alignItems: "center",
              }}
            >
              <PartSearch
                value={line.part}
                onChange={(val) => updateLine(line.id, "part", val)}
              />
              <input
                type="number"
                min="1"
                value={line.qty}
                onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                placeholder="0"
                style={{ ...inpS, textAlign: "center" }}
              />
              {form.lines.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: `0.5px solid ${D.redB}`,
                    background: "transparent",
                    color: D.redT,
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  title="Remove line"
                >
                  ×
                </button>
              ) : (
                <div />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addLine}
            style={{
              marginTop: 4,
              fontSize: 11,
              padding: "5px 12px",
              borderRadius: 6,
              border: `0.5px solid ${D.blue}`,
              background: "transparent",
              color: D.blueT,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Add part
          </button>
        </div>

        <div style={{ borderTop: `0.5px solid ${D.border}`, paddingTop: 14 }}>
          {!formValid && (
            <div
              style={{
                background: D.amberB,
                border: `0.5px solid ${D.amber}`,
                borderRadius: 7,
                padding: "8px 11px",
                marginBottom: 10,
                fontSize: 11,
                color: D.amberT,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontWeight: 600 }}>Missing:</span>
              <span style={{ color: D.t2 }}>{missingFields.join(", ")}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                ...btnS,
                background: D.bg3,
                color: D.t2,
                border: `0.5px solid ${D.border}`,
                fontWeight: 400,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!formValid}
              title={
                formValid
                  ? formAutoApprove
                    ? "Submit & auto-approve"
                    : "Submit ticket"
                  : `Complete: ${missingFields.join(", ")}`
              }
              style={{
                ...btnS,
                background: formValid ? (formAutoApprove ? D.green : D.blue) : D.bg3,
                color: formValid ? "#fff" : D.t3,
                cursor: formValid ? "pointer" : "not-allowed",
                opacity: formValid ? 1 : 0.7,
              }}
            >
              {formAutoApprove ? "Submit & auto-approve" : "Submit ticket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
