import type { CSSProperties } from "react";
import type { InventoryTheme } from "../lib/cores/inventory/theme";
import type { Project, ProjectItem } from "../lib/dummyData/mockDataCenter";

export type ProjectFormState = {
  name: string;
  site: string;
  dataHall: string;
  subsidiary: string;
  description: string;
};

export type ItemFormState = {
  partNumber: string;
  description: string;
  category: string;
  unit: string;
  qtyPlanned: string;
  qtyIns: string;
  qtyRet: string;
  unitPrice: string;
};

export type ProjectStats = {
  tot: number;
  ins: number;
  ret: number;
};

export type ProjectsPageProps = {
  theme: InventoryTheme;
  projects: Project[];
  prjSiteFilter: string;
  onClearSiteFilter: () => void;
  onSelectSite: (site: string) => void;
  activePrj: string;
  onActivePrjChange: (id: string) => void;
  userRole: string;
  showNewPrj: boolean;
  onShowNewPrjChange: (show: boolean) => void;
  pForm: ProjectFormState;
  onPFormChange: (updater: (f: ProjectFormState) => ProjectFormState) => void;
  locodes: readonly string[];
  onCreateProject: () => void;
  prj: Project | undefined;
  prjStats: ProjectStats | null;
  onCreateWorkOrder: (project: Project) => void;
  categoryColors: Record<string, string>;
  categories: readonly string[];
  showItemForm: boolean;
  onShowItemFormChange: (show: boolean) => void;
  editItem: string | null;
  onEditItemChange: (id: string | null) => void;
  iForm: ItemFormState;
  onIFormChange: (updater: (f: ItemFormState) => ItemFormState) => void;
  onResetItemForm: () => void;
  bomUnitPrice: (item: ProjectItem) => number;
  onSaveItem: () => void;
  onStartEditItem: (item: ProjectItem) => void;
  onDeleteItem: (id: string) => void;
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

export default function ProjectsPage({
  theme: D,
  projects,
  prjSiteFilter,
  onClearSiteFilter,
  onSelectSite,
  activePrj,
  onActivePrjChange,
  userRole,
  showNewPrj,
  onShowNewPrjChange,
  pForm,
  onPFormChange,
  locodes,
  onCreateProject,
  prj,
  prjStats,
  onCreateWorkOrder,
  categoryColors: CC,
  categories: CATS,
  showItemForm,
  onShowItemFormChange,
  editItem,
  onEditItemChange,
  iForm,
  onIFormChange,
  onResetItemForm,
  bomUnitPrice,
  onSaveItem,
  onStartEditItem,
  onDeleteItem,
}: ProjectsPageProps) {
  const { inpS, selS, btnS } = formStyles(D);
  const projectSites = [...new Set(projects.map((p) => p.code))].sort();
  const visibleProjects = prjSiteFilter
    ? projects.filter((p) => p.code === prjSiteFilter)
    : projects;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 10, color: D.t3, marginRight: 2, flexShrink: 0 }}>
            Site
          </span>
          <button
            type="button"
            onClick={onClearSiteFilter}
            style={{
              fontSize: 11,
              padding: "4px 12px",
              borderRadius: 20,
              border: `0.5px solid ${!prjSiteFilter ? D.blue : D.border}`,
              background: !prjSiteFilter ? D.blueB : "transparent",
              color: !prjSiteFilter ? D.blueT : D.t2,
              cursor: "pointer",
            }}
          >
            All
          </button>
          {projectSites.map((site) => (
            <button
              key={site}
              type="button"
              onClick={() => onSelectSite(site)}
              style={{
                fontSize: 11,
                padding: "4px 12px",
                borderRadius: 20,
                border: `0.5px solid ${prjSiteFilter === site ? D.blue : D.border}`,
                background: prjSiteFilter === site ? D.blueB : "transparent",
                color: prjSiteFilter === site ? D.blueT : D.t2,
                cursor: "pointer",
              }}
            >
              {site}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
            paddingLeft: 36,
          }}
        >
          {visibleProjects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onActivePrjChange(p.id)}
              style={{
                fontSize: 11,
                padding: "4px 12px",
                borderRadius: 20,
                border: `0.5px solid ${activePrj === p.id ? D.teal : D.border}`,
                background: activePrj === p.id ? D.tealB : "transparent",
                color: activePrj === p.id ? D.tealT : D.t2,
                cursor: "pointer",
                maxWidth: 240,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={p.name}
            >
              {p.name}
            </button>
          ))}
          {userRole === "ICS" && (
            <button
              type="button"
              onClick={() => onShowNewPrjChange(true)}
              style={{
                fontSize: 11,
                padding: "4px 11px",
                borderRadius: 20,
                border: `0.5px solid ${D.green}`,
                background: D.greenB,
                color: D.greenT,
                cursor: "pointer",
                flexShrink: 0,
                fontWeight: 500,
              }}
            >
              + New
            </button>
          )}
        </div>
      </div>

      {showNewPrj && (
        <div
          style={{
            background: D.bg1,
            border: `0.5px solid ${D.amber}`,
            borderRadius: 10,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 500, color: D.amberT, marginBottom: 12 }}>
            New project
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div style={{ gridColumn: "1/-1" }}>
              <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Project name</div>
              <input
                value={pForm.name}
                onChange={(e) => onPFormChange((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. OBG01 DH2 Optics, Cables & Consumables"
                style={inpS}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Site</div>
              <select
                value={pForm.site}
                onChange={(e) => onPFormChange((f) => ({ ...f, site: e.target.value }))}
                style={selS}
              >
                <option value="">Select…</option>
                {locodes.map((s) => (
                  <option key={s} value={s.split(" ")[0]}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Data hall</div>
              <input
                value={pForm.dataHall}
                onChange={(e) => onPFormChange((f) => ({ ...f, dataHall: e.target.value }))}
                placeholder="DH2"
                style={inpS}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Subsidiary</div>
              <input
                value={pForm.subsidiary}
                onChange={(e) => onPFormChange((f) => ({ ...f, subsidiary: e.target.value }))}
                placeholder="CoreWeave, Inc"
                style={inpS}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Description</div>
              <input
                value={pForm.description}
                onChange={(e) => onPFormChange((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional"
                style={inpS}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => onShowNewPrjChange(false)}
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
              onClick={onCreateProject}
              style={{ ...btnS, background: D.amber, color: "#000" }}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {prj && (
        <>
          <div
            style={{
              background: D.bg1,
              border: `0.5px solid ${D.border}`,
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: D.t1, marginBottom: 4 }}>
                  {prj.name}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: D.t3 }}>
                    Site: <span style={{ color: D.blueT }}>{prj.code}</span>
                  </span>
                  {prj.dataHall && (
                    <span style={{ fontSize: 11, color: D.t3 }}>
                      Hall: <span style={{ color: D.t2 }}>{prj.dataHall}</span>
                    </span>
                  )}
                  {prj.subsidiary && (
                    <span style={{ fontSize: 11, color: D.t3 }}>
                      Subsidiary: <span style={{ color: D.t2 }}>{prj.subsidiary}</span>
                    </span>
                  )}
                </div>
              </div>
              {prj.woNumber ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "#1a1a2e",
                    border: `0.5px solid ${D.purple}`,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: D.purple,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 9,
                        color: D.t3,
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                        marginBottom: 1,
                      }}
                    >
                      Work Order
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: D.purpleT,
                        letterSpacing: ".04em",
                      }}
                    >
                      {prj.woNumber}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onCreateWorkOrder(prj)}
                  style={{
                    ...btnS,
                    background: D.purple,
                    color: "#fff",
                    fontSize: 11,
                    padding: "6px 14px",
                    border: `0.5px solid ${D.purple}`,
                  }}
                >
                  Create Work Order
                </button>
              )}
            </div>
            {prjStats && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {(
                  [
                    ["Planned", prjStats.tot, D.t2],
                    ["Returned", prjStats.ret, D.amberT],
                    ["Installed", prjStats.ins, D.tealT],
                  ] as const
                ).map(([l, v, c]) => (
                  <div
                    key={l}
                    style={{ background: D.bg2, borderRadius: 8, padding: "8px 10px" }}
                  >
                    <div style={{ fontSize: 10, color: D.t3, marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              background: D.bg1,
              border: `0.5px solid ${D.border}`,
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                borderBottom: `0.5px solid ${D.border}`,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 500, color: D.t1 }}>Bill of materials</div>
              {!prj.woNumber && (
                <button
                  type="button"
                  onClick={() => {
                    onEditItemChange(null);
                    onResetItemForm();
                    onShowItemFormChange(true);
                  }}
                  style={{
                    ...btnS,
                    background: D.bg3,
                    color: D.t2,
                    border: `0.5px solid ${D.border}`,
                    fontWeight: 400,
                    fontSize: 11,
                    padding: "4px 12px",
                  }}
                >
                  + Add item
                </button>
              )}
            </div>
            {prj.woNumber && (
              <div
                style={{
                  padding: "8px 14px",
                  background: "#1a1a2e",
                  borderBottom: `0.5px solid ${D.purple}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: D.purple,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 11, color: D.t3 }}>
                  BOM locked — Work Order{" "}
                  <span style={{ color: D.purpleT, fontWeight: 600 }}>{prj.woNumber}</span> has
                  been created for this project.
                </span>
              </div>
            )}
            <table
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }}
            >
              <thead>
                <tr style={{ background: D.bg2 }}>
                  {[
                    "Part #",
                    "Description",
                    "Category",
                    "Planned",
                    "Returned",
                    "Installed",
                    "Unit Price",
                    "Total Value",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "7px 10px",
                        textAlign: "left",
                        fontSize: 10,
                        color: D.t3,
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prj.items.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        fontSize: 12,
                        color: D.t3,
                        fontStyle: "italic",
                      }}
                    >
                      No items yet.
                    </td>
                  </tr>
                )}
                {prj.items.map((item, i) => {
                  const u = bomUnitPrice(item);
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderTop: `0.5px solid ${D.border}`,
                        background: i % 2 === 0 ? "transparent" : D.bg2,
                      }}
                    >
                      <td style={{ padding: "7px 10px", color: D.blueT, fontWeight: 500 }}>
                        {item.partNumber}
                      </td>
                      <td style={{ padding: "7px 10px", color: D.t1 }}>{item.description}</td>
                      <td style={{ padding: "7px 10px" }}>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 7px",
                            borderRadius: 20,
                            background: D.bg3,
                            color: CC[item.category] || D.t2,
                            border: `0.5px solid ${CC[item.category] || D.border}`,
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: "7px 10px", color: D.t2 }}>{item.qtyPlanned}</td>
                      <td style={{ padding: "7px 10px", color: D.amberT }}>{item.qtyRet}</td>
                      <td style={{ padding: "7px 10px", color: D.tealT, fontWeight: 500 }}>
                        {item.qtyIns}
                      </td>
                      <td style={{ padding: "7px 10px", color: D.t2, fontSize: 11 }}>
                        {u > 0
                          ? `$${u.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td
                        style={{
                          padding: "7px 10px",
                          color: D.greenT,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {u > 0
                          ? `$${(u * item.qtyPlanned).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        {prj.woNumber ? (
                          <span style={{ fontSize: 10, color: D.t3, fontStyle: "italic" }}>
                            Locked
                          </span>
                        ) : (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => onStartEditItem(item)}
                              style={{
                                fontSize: 10,
                                padding: "2px 7px",
                                borderRadius: 4,
                                border: `0.5px solid ${D.border}`,
                                background: "transparent",
                                color: D.t3,
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item.id)}
                              style={{
                                fontSize: 10,
                                padding: "2px 7px",
                                borderRadius: 4,
                                border: `0.5px solid ${D.redB}`,
                                background: "transparent",
                                color: D.redT,
                                cursor: "pointer",
                              }}
                            >
                              Del
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {prj.items.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: `1px solid ${D.borderH}`, background: D.bg2 }}>
                    <td
                      colSpan={3}
                      style={{ padding: "7px 10px", fontSize: 11, color: D.t3, fontWeight: 500 }}
                    >
                      Totals
                    </td>
                    <td style={{ padding: "7px 10px", fontSize: 12, color: D.t2, fontWeight: 600 }}>
                      {prj.items.reduce((s, i) => s + i.qtyPlanned, 0)}
                    </td>
                    <td
                      style={{ padding: "7px 10px", fontSize: 12, color: D.amberT, fontWeight: 600 }}
                    >
                      {prj.items.reduce((s, i) => s + i.qtyRet, 0)}
                    </td>
                    <td style={{ padding: "7px 10px", fontSize: 12, color: D.tealT, fontWeight: 600 }}>
                      {prj.items.reduce((s, i) => s + i.qtyIns, 0)}
                    </td>
                    <td style={{ padding: "7px 10px", fontSize: 11, color: D.t3 }} />
                    <td
                      style={{ padding: "7px 10px", fontSize: 12, color: D.greenT, fontWeight: 700 }}
                    >
                      {(() => {
                        const tot = prj.items.reduce(
                          (s, i) => s + bomUnitPrice(i) * i.qtyPlanned,
                          0,
                        );
                        return tot > 0
                          ? `$${tot.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "—";
                      })()}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {showItemForm && (
            <div
              style={{
                background: D.bg1,
                border: `0.5px solid ${D.blue}`,
                borderRadius: 10,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 500, color: D.blueT, marginBottom: 12 }}>
                {editItem ? "Edit item" : "Add item"}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Part number</div>
                  <input
                    value={iForm.partNumber}
                    onChange={(e) =>
                      onIFormChange((f) => ({ ...f, partNumber: e.target.value }))
                    }
                    placeholder="SFP-10G-SR"
                    style={inpS}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Description</div>
                  <input
                    value={iForm.description}
                    onChange={(e) =>
                      onIFormChange((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="10G SR Optic"
                    style={inpS}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Category</div>
                  <select
                    value={iForm.category}
                    onChange={(e) => onIFormChange((f) => ({ ...f, category: e.target.value }))}
                    style={selS}
                  >
                    {CATS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Unit</div>
                  <input
                    value={iForm.unit}
                    onChange={(e) => onIFormChange((f) => ({ ...f, unit: e.target.value }))}
                    placeholder="ea"
                    style={inpS}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Qty planned</div>
                  <input
                    type="number"
                    min="0"
                    value={iForm.qtyPlanned}
                    onChange={(e) => onIFormChange((f) => ({ ...f, qtyPlanned: e.target.value }))}
                    style={inpS}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Qty installed</div>
                  <input
                    type="number"
                    min="0"
                    value={iForm.qtyIns}
                    onChange={(e) => onIFormChange((f) => ({ ...f, qtyIns: e.target.value }))}
                    style={inpS}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Qty returned</div>
                  <input
                    type="number"
                    min="0"
                    value={iForm.qtyRet}
                    onChange={(e) => onIFormChange((f) => ({ ...f, qtyRet: e.target.value }))}
                    style={inpS}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: D.t3, marginBottom: 4 }}>Unit Price ($)</div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={iForm.unitPrice}
                    onChange={(e) => onIFormChange((f) => ({ ...f, unitPrice: e.target.value }))}
                    placeholder="0.00"
                    style={inpS}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    onShowItemFormChange(false);
                    onEditItemChange(null);
                  }}
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
                  onClick={onSaveItem}
                  style={{ ...btnS, background: D.blue, color: "#fff" }}
                >
                  {editItem ? "Save" : "Add item"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
