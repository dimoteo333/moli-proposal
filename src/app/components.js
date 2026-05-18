// Shared UI primitives for MOLI Public Proposal Agent
// React from CDN; no JSX imports needed (Babel transpiles each file).

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ----- Icons (small inline SVGs) -----
function Icon({ name, size = 20, stroke = 1.7, color = "currentColor" }) {
  const s = { width: size, height: size, color };
  const sw = stroke;
  switch (name) {
    case "back": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6"/></svg>
    );
    case "menu": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/></svg>
    );
    case "help": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7v.5"/><circle cx="12" cy="17" r="0.5" fill={color}/></svg>
    );
    case "search": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
    );
    case "plus": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    );
    case "check": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw + 0.5} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/></svg>
    );
    case "close": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    );
    case "upload": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    );
    case "file": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    );
    case "doc": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/></svg>
    );
    case "link": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>
    );
    case "share": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
    );
    case "copy": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
    );
    case "mail": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>
    );
    case "edit": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
    );
    case "filter": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
    );
    case "sort": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h13"/><path d="M3 12h9"/><path d="M3 18h5"/><path d="M17 9l3-3 3 3"/><path d="M20 6v12"/></svg>
    );
    case "info": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.5" fill={color}/></svg>
    );
    case "warn": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.3 3.7L2.5 17.5A2 2 0 0 0 4.2 20.5h15.6A2 2 0 0 0 21.5 17.5L13.7 3.7a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill={color}/></svg>
    );
    case "sparkle": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 14l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z"/></svg>
    );
    case "chevron-right": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/></svg>
    );
    case "chevron-down": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"/></svg>
    );
    case "chevron-up": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"/></svg>
    );
    case "lock": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>
    );
    case "shield": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    );
    case "calendar": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>
    );
    case "clock": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
    );
    case "down": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    );
    case "external": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
    );
    case "refresh": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/><path d="M20.5 15A9 9 0 1 1 19 6"/></svg>
    );
    case "trash": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
    );
    case "eye": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
    );
    case "moli": return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="14" rx="6"/><circle cx="9" cy="13" r="1.2" fill={color} stroke="none"/><circle cx="15" cy="13" r="1.2" fill={color} stroke="none"/><path d="M12 3v3"/></svg>
    );
    default: return null;
  }
}

// ----- Layout primitives -----

function AppBar({ title, onBack, right, transparent }) {
  return (
    <header className="app-bar" style={transparent ? { background: "rgba(255,255,255,0)", borderBottom: "none" } : null}>
      {onBack ? (
        <button className="back" onClick={onBack} aria-label="뒤로가기">
          <Icon name="back" size={22}/>
        </button>
      ) : <div style={{ width: 8 }}/>}
      <div className="title">{title}</div>
      <div className="actions">{right}</div>
    </header>
  );
}

function Page({ title, onBack, right, hasBottomBar, transparentBar, children, bottomBar, scrollRef }) {
  return (
    <>
      {title !== undefined && <AppBar title={title} onBack={onBack} right={right} transparent={transparentBar}/>}
      <div className={"scroll-body" + (hasBottomBar ? " has-bottom-bar" : "")} ref={scrollRef}>
        {children}
      </div>
      {bottomBar}
    </>
  );
}

function BottomBar({ children, summary }) {
  return (
    <div className="bottom-bar">
      {summary && <div className="bottom-summary" style={{ marginBottom: children ? 10 : 0 }}>{summary}</div>}
      {children}
    </div>
  );
}

// ----- Reusable elements -----

function Badge({ tone = "neutral", children, dot = false, size }) {
  return <span className={`badge ${tone}${size === "lg" ? " lg" : ""}`}>
    {dot && <span className="dot"/>}
    {children}
  </span>;
}

function Checkbox({ checked, onChange, label, ariaLabel }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel || label || "선택"}
      className={"cb" + (checked ? " checked" : "")}
      onClick={(e) => { e.stopPropagation(); onChange?.(!checked); }}
      type="button"
    >
      {checked && <Icon name="check" size={14} color="#fff" stroke={3}/>}
    </button>
  );
}

function Confidence({ value }) {
  const pct = Math.round(value * 100);
  const tone = pct >= 80 ? "success" : pct >= 60 ? "info" : "warning";
  const label = pct >= 80 ? "높음" : pct >= 60 ? "보통" : "낮음";
  return (
    <span className="tag" aria-label={`신뢰도 ${pct} 퍼센트`}>
      <span style={{
        width: 8, height: 8, borderRadius: 2,
        background: tone === "success" ? "var(--color-success)" :
                    tone === "info" ? "var(--color-info)" : "var(--color-warning)"
      }}/>
      신뢰도 {pct}% · {label}
    </span>
  );
}

function RiskBadge({ level }) {
  if (level === "low") return <Badge tone="success" dot>리스크 낮음</Badge>;
  if (level === "medium") return <Badge tone="warning" dot>리스크 보통</Badge>;
  if (level === "high") return <Badge tone="danger" dot>리스크 높음</Badge>;
  return null;
}

function RecommendBadge({ rec }) {
  const map = {
    strong: { tone: "ai", label: "강력 추천" },
    recommend: { tone: "primary", label: "추천" },
    optional: { tone: "neutral", label: "선택" },
    not: { tone: "danger", label: "비추천" },
    review: { tone: "warning", label: "검토 필요" }
  };
  const c = map[rec] || map.optional;
  return <Badge tone={c.tone}>{c.label}</Badge>;
}

function StatusBadge({ status }) {
  const map = {
    parsing: { tone: "info", label: "분석중", dot: true },
    review: { tone: "warning", label: "검토 필요", dot: true },
    report: { tone: "success", label: "레포트 생성됨", dot: true },
    shared: { tone: "primary", label: "공유됨", dot: true },
    expired: { tone: "neutral", label: "만료됨", dot: true }
  };
  const c = map[status] || { tone: "neutral", label: status };
  return <Badge tone={c.tone} dot={c.dot}>{c.label}</Badge>;
}

function MMRange({ min, recommended, max }) {
  // map 0..max to 0..100
  const left = (min / max) * 100;
  const width = ((max - min) / max) * 100;
  const dot = (recommended / max) * 100;
  return (
    <div className="mm-range">
      <div className="span" style={{ left: `${left}%`, width: `${width}%` }}/>
      <div className="dot" style={{ left: `${dot}%` }}/>
    </div>
  );
}

function RoleSplit({ role, max }) {
  const ROLES = window.MOLI_DATA.ROLES;
  const entries = ROLES.map(r => ({ ...r, value: role[r.key] || 0 })).filter(r => r.value > 0);
  const total = entries.reduce((s, r) => s + r.value, 0) || 1;
  return (
    <div>
      <div className="role-split">
        {entries.map(r => (
          <span key={r.key}
            style={{ background: r.color, width: `${(r.value / total) * 100}%` }}
            title={`${r.label} ${r.value.toFixed(1)} MM`}
          />
        ))}
      </div>
      <div className="role-legend">
        {entries.map(r => (
          <span key={r.key} className="item">
            <span className="swatch" style={{ background: r.color }}/>
            {r.label} <strong style={{ fontWeight: 600 }}>{r.value.toFixed(1)}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

// ----- Drawer -----

function Drawer({ open, onClose, title, children, footer }) {
  return (
    <>
      <div className={"drawer-backdrop" + (open ? " open" : "")} onClick={onClose}/>
      <div className={"drawer" + (open ? " open" : "")} role="dialog" aria-modal="true">
        <div className="handle"/>
        <div className="drawer-header">
          <div className="title">{title}</div>
          <button className="icon-btn" onClick={onClose} aria-label="닫기"
            style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>
            <Icon name="close" size={20}/>
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer}
      </div>
    </>
  );
}

// ----- Toast -----

function Toast({ messages }) {
  if (!messages.length) return null;
  return (
    <div className="toast-host">
      {messages.map(m => (
        <div key={m.id} className="toast">
          <Icon name="check" size={16} color="#fff" stroke={3}/>
          <span style={{ flex: 1 }}>{m.text}</span>
        </div>
      ))}
    </div>
  );
}

// Hook to manage transient toasts
function useToasts() {
  const [messages, setMessages] = useState([]);
  const push = useCallback((text) => {
    const id = Math.random().toString(36).slice(2);
    setMessages(m => [...m, { id, text }]);
    setTimeout(() => setMessages(m => m.filter(x => x.id !== id)), 2400);
  }, []);
  return { messages, push };
}

// Export shared things globally
Object.assign(window, {
  Icon, AppBar, Page, BottomBar, Badge, Checkbox, Confidence, RiskBadge,
  RecommendBadge, StatusBadge, MMRange, RoleSplit, Drawer, Toast, useToasts
});
