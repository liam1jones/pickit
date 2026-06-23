/** Top-bar view switcher (Board / List / Projects / Analytics / Flowchart).
 *  Extracted from App.jsx so the nav is reusable and easy to extend.
 *  Expects the theme object (D) so it stays visually consistent with the app
 *  without duplicating color tokens. */
export const VIEWS = ["board", "list", "projects", "analytics", "flowchart"];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ViewNav({ view, onChange, theme: D, views = VIEWS }) {
  return (
    <>
      <div style={{ width: "0.5px", height: 14, background: D.border }} />
      {views.map((v) => (
        <button
          key={v}
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
