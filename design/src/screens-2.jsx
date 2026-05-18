// MOLI screens part 2: Checklist Workbench, Evidence Drawer, Package Compare, Report, Email, Share

const { useState: useStateB, useMemo: useMemoB, useRef: useRefB, useEffect: useEffectB } = React;

// ===== Checklist Workbench =====
function ChecklistScreen({ nav, toast }) {
  const data = window.MOLI_DATA;
  const [pkg, setPkg] = useStateB("M");
  // Each requirement -> {included, mmOverride}
  const initial = useMemoB(() => {
    const s = {};
    data.requirements.forEach(r => { s[r.id] = { included: r.packages[pkg], mmOverride: null, expanded: false }; });
    return s;
  }, []);
  const [state, setState] = useStateB(initial);
  const [customMode, setCustomMode] = useStateB(false);
  const [filter, setFilter] = useStateB("all");
  const [evidenceItem, setEvidenceItem] = useStateB(null);

  // When switching pkg, reset includes (unless customMode is already user-driven)
  function switchPkg(next) {
    setPkg(next);
    setCustomMode(false);
    const ns = {};
    data.requirements.forEach(r => {
      ns[r.id] = { ...state[r.id], included: r.packages[next] };
    });
    setState(ns);
  }

  function toggle(id) {
    setState(s => ({ ...s, [id]: { ...s[id], included: !s[id].included } }));
    setCustomMode(true);
    toast("견적이 재산정되었습니다.");
  }
  function expand(id) {
    setState(s => ({ ...s, [id]: { ...s[id], expanded: !s[id].expanded } }));
  }

  const totalMM = useMemoB(() => {
    let mm = 0;
    data.requirements.forEach(r => {
      if (state[r.id]?.included) {
        mm += state[r.id].mmOverride ?? r.mm.recommended;
      }
    });
    return mm;
  }, [state]);

  const baseMM = useMemoB(() => {
    let mm = 0;
    data.requirements.forEach(r => {
      if (r.packages[pkg]) mm += r.mm.recommended;
    });
    return mm;
  }, [pkg]);

  const delta = totalMM - baseMM;
  const included = data.requirements.filter(r => state[r.id]?.included);
  const filtered = data.requirements.filter(r => {
    if (filter === "all") return true;
    if (filter === "mandatory") return r.mandatory;
    if (filter === "func") return r.type.startsWith("기능");
    if (filter === "infra") return r.type === "인프라";
    if (filter === "security") return r.type === "보안";
    if (filter === "proposal") return r.type === "제안 아이템";
    if (filter === "review") return r.recommendation === "review";
    return true;
  });

  const counts = {
    all: data.requirements.length,
    mandatory: data.requirements.filter(r => r.mandatory).length,
    func: data.requirements.filter(r => r.type.startsWith("기능")).length,
    infra: data.requirements.filter(r => r.type === "인프라").length,
    security: data.requirements.filter(r => r.type === "보안").length,
    proposal: data.requirements.filter(r => r.type === "제안 아이템").length,
    review: data.requirements.filter(r => r.recommendation === "review").length
  };

  return (
    <Page title="공수 산정" onBack={() => nav("summary")} hasBottomBar
      right={<>
        <button className="icon-btn" aria-label="정렬"><Icon name="sort" size={20}/></button>
        <button className="icon-btn" aria-label="필터"><Icon name="filter" size={20}/></button>
      </>}
      bottomBar={
        <BottomBar
          summary={
            <>
              <div className="info">
                <div className="label">총 공수</div>
                <div className="value">
                  {totalMM.toFixed(1)} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-muted)" }}>MM</span>
                  <span className="pkg">· {customMode ? "Custom" : data.packages[pkg].name}</span>
                </div>
              </div>
              {customMode && (
                <div className={"delta " + (delta < 0 ? "neg" : "")}>
                  {delta >= 0 ? "+" : ""}{delta.toFixed(1)} MM
                </div>
              )}
            </>
          }>
          <div className="row gap-8">
            <button className="btn secondary" style={{ flex: 1 }} onClick={() => nav("packages")}>
              <Icon name="filter" size={16}/>
              패키지 비교
            </button>
            <button className="btn primary" style={{ flex: 1 }} onClick={() => nav("report")}>
              레포트 생성
            </button>
          </div>
        </BottomBar>
      }>
      {/* Segmented control for package */}
      <div className="page-padding-h" style={{ paddingTop: 12, paddingBottom: 4, background: "rgba(246, 248, 251, 0.96)", position: "sticky", top: 0, zIndex: 10 }}>
        <div className="seg-control" role="tablist" aria-label="패키지 선택">
          {["S", "M", "L"].map(k => (
            <button key={k} role="tab" aria-selected={pkg === k}
              className={pkg === k ? "active" : ""}
              onClick={() => switchPkg(k)}>
              {pkg === k && <Icon name="check" size={14} color="var(--color-primary)" stroke={3}/>}
              {data.packages[k].name}
            </button>
          ))}
        </div>
        <div className="chip-row" style={{ paddingLeft: 0, paddingRight: 0, marginLeft: 0, marginRight: 0 }}>
          {[
            { k: "all", l: "전체" },
            { k: "mandatory", l: "필수" },
            { k: "func", l: "기능" },
            { k: "infra", l: "인프라" },
            { k: "security", l: "보안" },
            { k: "proposal", l: "제안 아이템" },
            { k: "review", l: "검토 필요" }
          ].map(c => (
            <button key={c.k} className={"chip" + (filter === c.k ? " active" : "")} onClick={() => setFilter(c.k)}>
              {c.l} <span className="count">{counts[c.k]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="page-padding" style={{ paddingTop: 4 }}>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 10, paddingLeft: 4 }}>
          {included.length} / {data.requirements.length} 항목 포함 · 표시 {filtered.length}
        </div>
        {filtered.map(r => (
          <ReqCard key={r.id} req={r} state={state[r.id]}
            onToggle={() => toggle(r.id)}
            onExpand={() => expand(r.id)}
            onEvidence={() => setEvidenceItem(r)}/>
        ))}
        <button className="btn secondary" style={{ width: "100%", marginTop: 8 }}>
          <Icon name="plus" size={16}/>
          제안 아이템 직접 추가
        </button>
        <div className="section-spacer"/>
      </div>

      <Drawer open={!!evidenceItem} onClose={() => setEvidenceItem(null)} title="산정 근거">
        {evidenceItem && <EvidenceContent req={evidenceItem}/>}
      </Drawer>
    </Page>
  );
}

function ReqCard({ req, state, onToggle, onExpand, onEvidence }) {
  const data = window.MOLI_DATA;
  const included = state.included;
  const expanded = state.expanded;
  const mm = state.mmOverride ?? req.mm.recommended;
  const typeBadge = () => {
    const map = {
      "기능": "primary",
      "기능 · AI": "ai",
      "인프라": "info",
      "데이터 이관": "warning",
      "보안": "danger",
      "교육": "neutral",
      "운영": "neutral",
      "제안 아이템": "ai"
    };
    return <Badge tone={map[req.type] || "neutral"}>{req.type}</Badge>;
  };
  return (
    <div className={"req-card" + (included ? "" : " excluded") + (expanded ? " expanded" : "")}>
      <div className="row1">
        <Checkbox checked={included} onChange={onToggle} ariaLabel={`${req.title} 포함 여부`}/>
        <div className="body" onClick={onExpand} style={{ cursor: "pointer" }}>
          <div className="row" style={{ gap: 8, alignItems: "flex-start", justifyContent: "space-between" }}>
            <div className="title ko">{req.title}</div>
            <div className="mm">{mm.toFixed(1)} MM</div>
          </div>
          <div className="meta-row">
            {typeBadge()}
            {req.mandatory && <Badge tone="outline">필수</Badge>}
            <RecommendBadge rec={req.recommendation}/>
            {req.evidence.length === 0 && <Badge tone="warning">근거 없음</Badge>}
          </div>
          <div className="row gap-12" style={{ marginTop: 8, flexWrap: "wrap" }}>
            <Confidence value={req.confidence}/>
            <span className="tag">
              <Icon name="file" size={12}/> 근거 {req.evidence.length}건
            </span>
            <RiskBadge level={req.risk}/>
          </div>
        </div>
        <button onClick={onExpand}
          style={{ width: 32, height: 32, color: "var(--color-text-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          aria-label="펼치기">
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={18}/>
        </button>
      </div>

      {expanded && (
        <div className="expand-body">
          <div className="kv">
            <span className="k">공수 범위</span>
            <div className="row between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                <span style={{ fontWeight: 600, color: "var(--color-navy)" }}>{req.mm.min.toFixed(1)}</span> – {req.mm.recommended.toFixed(1)} – <span style={{ fontWeight: 600, color: "var(--color-navy)" }}>{req.mm.max.toFixed(1)}</span> MM
              </span>
              <button className="btn ghost sm" style={{ height: 24, padding: 0, fontSize: 12 }}>
                <Icon name="edit" size={12}/> 직접 수정
              </button>
            </div>
            <MMRange min={req.mm.min} recommended={req.mm.recommended} max={req.mm.max}/>
          </div>

          <div className="kv">
            <span className="k">역할별 분배</span>
            <RoleSplit role={req.role}/>
          </div>

          <div className="recommend-reason ko">
            <span className="lbl">AI 추천 근거</span>
            {req.reason}
          </div>

          <div className="actions">
            <button className="btn secondary sm" onClick={onEvidence}>
              <Icon name="file" size={14}/>
              근거 보기
            </button>
            <button className="btn secondary sm">
              <Icon name="edit" size={14}/>
              가정 편집
            </button>
            <button className="btn secondary sm">
              <Icon name="plus" size={14}/>
              댓글
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceContent({ req }) {
  const data = window.MOLI_DATA;
  return (
    <div>
      <div className="row between" style={{ marginBottom: 12 }}>
        <div className="ko" style={{ fontSize: 15, fontWeight: 600, color: "var(--color-navy)" }}>{req.title}</div>
      </div>
      {req.evidence.length === 0 ? (
        <div style={{ padding: 16, background: "var(--color-warning-soft)", borderRadius: 12, fontSize: 13, color: "var(--color-warning)", textAlign: "center" }}>
          이 항목은 AI 제안 아이템으로, 원문 근거가 없습니다.
        </div>
      ) : (
        <div className="col gap-12">
          {req.evidence.map(eid => {
            const ev = data.evidence[eid];
            return (
              <div key={eid}>
                <div className="row gap-8" style={{ marginBottom: 6, alignItems: "center" }}>
                  <Icon name="file" size={14} color="var(--color-info)"/>
                  <span style={{ fontSize: 12.5, color: "var(--color-info)", fontWeight: 600 }}>{ev.source}</span>
                </div>
                <div className="evidence-quote ko">
                  <span className="source">원문 발췌</span>
                  "{ev.quote}"
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>산정 근거</div>
                  <div className="col" style={{ background: "#fafbfc", borderRadius: 12, padding: "8px 12px", border: "1px solid var(--color-border)" }}>
                    {ev.basis.map(([k, v], i) => (
                      <div key={i} className="row between" style={{ padding: "6px 0", borderBottom: i < ev.basis.length - 1 ? "1px solid var(--color-border)" : "none", fontSize: 13 }}>
                        <span style={{ color: "var(--color-text-muted)" }}>{k}</span>
                        <span style={{ color: "var(--color-navy)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="row gap-8" style={{ marginTop: 16 }}>
        <button className="btn secondary" style={{ flex: 1 }}>
          <Icon name="external" size={14}/>
          원문 위치 보기
        </button>
        <button className="btn secondary" style={{ flex: 1 }}>
          <Icon name="edit" size={14}/>
          가정 편집
        </button>
      </div>
    </div>
  );
}

// ===== Package Comparison =====
function PackagesScreen({ nav }) {
  const data = window.MOLI_DATA;
  const [selected, setSelected] = useStateB("M");

  // calculated totals per package
  const totals = useMemoB(() => {
    const out = {};
    ["S", "M", "L"].forEach(k => {
      let mm = 0, count = 0, prop = 0;
      data.requirements.forEach(r => {
        if (r.packages[k]) {
          mm += r.mm.recommended;
          count++;
          if (r.type === "제안 아이템") prop++;
        }
      });
      out[k] = { mm, count, prop };
    });
    return out;
  }, []);

  return (
    <Page title="패키지 비교" onBack={() => nav("checklist")} hasBottomBar
      bottomBar={<BottomBar><button className="btn primary block" onClick={() => nav("report")}>
        {data.packages[selected].name} 패키지로 레포트 생성
      </button></BottomBar>}>
      <div className="page-padding">
        <div className="ko" style={{ fontSize: 13.5, color: "var(--color-text-muted)", lineHeight: 1.55, marginBottom: 16 }}>
          예상 공수와 차별화 항목을 비교해 가장 적합한 입찰 전략을 선택하세요.
          선택 시 체크리스트가 자동 반영됩니다.
        </div>

        {["S", "M", "L"].map(k => {
          const p = data.packages[k];
          const t = totals[k];
          return (
            <div key={k} className={"pkg-card " + (selected === k ? "selected" : "")} onClick={() => setSelected(k)}>
              <div className="head-row">
                <div>
                  <div className="name">{p.name}</div>
                  <div className="tagline ko">{p.tagline}</div>
                </div>
                <div style={{ width: 24, height: 24, borderRadius: 50, border: "2px solid var(--color-border-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selected === k && <div style={{ width: 12, height: 12, borderRadius: 50, background: "var(--color-primary)" }}/>}
                </div>
              </div>
              <div className="mm-block">
                <div className="num">{t.mm.toFixed(1)}</div>
                <div className="unit">MM</div>
                <div className="range">신뢰도 {Math.round(p.confidence * 100)}%</div>
              </div>
              <div className="features">
                {p.features.map((f, i) => (
                  <div key={i} className="item">
                    <Icon name="check" size={14} color="var(--color-success)" stroke={2.5}/>
                    <span className="ko">{f}</span>
                  </div>
                ))}
              </div>
              <div className="stats">
                <div className="stat">요구사항<strong>{t.count}개</strong></div>
                <div className="stat">제안 아이템<strong>{t.prop}개</strong></div>
                <div className="stat">리스크<strong>{p.risk}</strong></div>
              </div>
              <div className="ko" style={{ marginTop: 12, padding: 10, background: selected === k ? "var(--color-primary-soft)" : "#fafbfc", borderRadius: 10, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--color-navy)" }}>적합한 경우:</strong> {p.bestFor}
              </div>
            </div>
          );
        })}

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-section">
            <div className="card-title">차별화 요소 비교</div>
            <div className="col gap-12">
              {[
                ["AI 이벤트 분류 모델", { S: false, M: true, L: true }],
                ["XAI 설명 가능성 모듈", { S: false, M: false, L: true }],
                ["실시간 KPI 대시보드", { S: false, M: true, L: true }],
                ["사고 대응 자동화 Runbook", { S: false, M: true, L: true }],
                ["데이터 거버넌스", { S: false, M: false, L: true }]
              ].map(([label, map], i) => (
                <div key={i} className="row between" style={{ fontSize: 13.5 }}>
                  <span className="ko" style={{ color: "var(--color-text)", flex: 1 }}>{label}</span>
                  <div className="row gap-8">
                    {["S", "M", "L"].map(k => (
                      <span key={k} style={{
                        width: 28, height: 22, borderRadius: 6,
                        background: map[k] ? "var(--color-success-soft)" : "#f1f3f7",
                        color: map[k] ? "var(--color-success)" : "var(--color-text-subtle)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700
                      }}>
                        {map[k] ? <Icon name="check" size={12} color="var(--color-success)" stroke={3}/> : "—"}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="section-spacer"/>
      </div>
    </Page>
  );
}

// ===== Report Preview =====
function ReportScreen({ nav, toast }) {
  const data = window.MOLI_DATA;
  const [section, setSection] = useStateB(0);
  const sections = ["요약", "공수 산정", "WBS", "리스크"];

  return (
    <Page title="레포트 미리보기" onBack={() => nav("checklist")} hasBottomBar
      right={<>
        <button className="icon-btn" aria-label="다운로드"><Icon name="down" size={20}/></button>
        <button className="icon-btn" aria-label="공유" onClick={() => nav("share")}><Icon name="share" size={20}/></button>
      </>}
      bottomBar={
        <BottomBar>
          <div className="row gap-8">
            <button className="btn secondary" style={{ flex: 1 }} onClick={() => nav("email")}>
              <Icon name="mail" size={16}/>
              메일 초안
            </button>
            <button className="btn primary" style={{ flex: 1 }} onClick={() => nav("share")}>
              <Icon name="share" size={16} color="#fff"/>
              공유하기
            </button>
          </div>
        </BottomBar>
      }>
      <div className="page-padding-h" style={{ background: "rgba(246,248,251,0.96)", position: "sticky", top: 0, zIndex: 10, paddingTop: 12, paddingBottom: 4 }}>
        <div className="chip-row" style={{ marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0 }}>
          {sections.map((s, i) => (
            <button key={i} className={"chip" + (section === i ? " active" : "")} onClick={() => setSection(i)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="page-padding">
        <div className="row gap-8" style={{ marginBottom: 12, padding: "10px 12px", background: "var(--color-info-soft)", borderRadius: 12 }}>
          <Icon name="info" size={16} color="var(--color-info)"/>
          <div className="ko" style={{ fontSize: 12.5, color: "var(--color-navy)", lineHeight: 1.45 }}>
            레포트 본문은 영문으로 생성됩니다. 한글 제목·메뉴는 그대로 유지됩니다.
          </div>
        </div>

        <div className="report-doc">
          {section === 0 && (
            <>
              <div className="small-label">EXECUTIVE SUMMARY</div>
              <h2 style={{ marginTop: 0 }}>Integrated Transit Operations &amp; AI Support Platform — RFP Review</h2>
              <p>{data.report.summaryEN}</p>

              <h2>Scope Interpretation</h2>
              <p>{data.report.scopeEN}</p>

              <h2>Recommendation</h2>
              <p><strong>Medium</strong> package is recommended. The AI event-classification module and operations KPI dashboard create meaningful differentiation against likely incumbent SI competitors, while keeping delivery risk inside the 14-month window.</p>
            </>
          )}
          {section === 1 && (
            <>
              <div className="small-label">EFFORT ESTIMATE SUMMARY</div>
              <h2 style={{ marginTop: 0 }}>Estimated Effort — 42.5 MM</h2>
              <p>Range 35.0–52.0 MM at 78% confidence. Calculation combines RFP requirement-based estimation, KOSA guide assumptions, and ISBSG productivity ranges. Budget reverse-estimation implies a unit cost band of KRW 11–13M per MM.</p>
              <div style={{ marginTop: 16 }}>
                {data.report.estimateRows.map((r, i) => (
                  <div key={i} className="estimate-row">
                    <span className="label">{r[0]}</span>
                    <span className="val">{r[1]}</span>
                  </div>
                ))}
                <div className="estimate-row" style={{ borderTop: "2px solid var(--color-navy)", borderBottom: "none", marginTop: 4, paddingTop: 10 }}>
                  <span className="label" style={{ color: "var(--color-navy)", fontWeight: 700 }}>Total</span>
                  <span className="val" style={{ fontSize: 15 }}>42.5 MM</span>
                </div>
              </div>
              <h2>Calculation Methodology</h2>
              <p>Three estimation layers were applied with weighted reconciliation: requirement-based bottom-up (60%), KOSA guide reference (25%), and procurement budget reverse-estimation (15%). Internal historical calibration was not applied — no comparable internal record exists in the current dataset.</p>
            </>
          )}
          {section === 2 && (
            <>
              <div className="small-label">WORK BREAKDOWN STRUCTURE</div>
              <h2 style={{ marginTop: 0 }}>Delivery Plan (14 months)</h2>
              <div style={{ marginTop: 12 }}>
                {[
                  ["1. Inception & Architecture", "M1–M2", "PM, Architect"],
                  ["2. Core Console & Auth", "M2–M5", "Frontend, Backend"],
                  ["3. AI Event Model PoC", "M3–M6", "Data, Architect"],
                  ["4. Infra & CSAP Setup", "M3–M7", "Infra, Security"],
                  ["5. Historical Data ETL", "M5–M9", "Data, Backend"],
                  ["6. Integration & Test", "M8–M11", "QA, Backend"],
                  ["7. Pilot & Stabilisation", "M11–M13", "All"],
                  ["8. Training & Handover", "M13–M14", "PM, QA"]
                ].map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "10px 0", borderBottom: i < 7 ? "1px solid var(--color-border)" : "none" }}>
                    <div>
                      <div style={{ fontSize: 13.5, color: "var(--color-navy)", fontWeight: 600 }}>{row[0]}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2 }}>{row[2]}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-info)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{row[1]}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {section === 3 && (
            <>
              <div className="small-label">RISK &amp; MITIGATION</div>
              <h2 style={{ marginTop: 0 }}>Top Risks</h2>
              {data.report.risksEN.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 2 ? "1px solid var(--color-border)" : "none", alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 7, background: "var(--color-warning-soft)", color: "var(--color-warning)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: 12
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 13.5, color: "var(--color-text)", lineHeight: 1.55 }}>{r}</div>
                </div>
              ))}
              <h2>Open Questions for Human Review</h2>
              <p>Two RFP items remain ambiguous: (1) the volume and shape of unstructured historical logs targeted for migration, and (2) quantitative acceptance criteria for the AI event-classification model. Both require clarification from the procuring authority before bid finalisation.</p>
            </>
          )}
        </div>

        <div className="row gap-8" style={{ marginTop: 16 }}>
          <button className="btn secondary" style={{ flex: 1 }} onClick={() => toast("이 섹션을 복사했습니다.")}>
            <Icon name="copy" size={14}/>
            섹션 복사
          </button>
          <button className="btn secondary" style={{ flex: 1 }}>
            <Icon name="down" size={14}/>
            전체 PDF
          </button>
        </div>
        <div className="section-spacer"/>
      </div>
    </Page>
  );
}

// ===== Email Draft =====
function EmailScreen({ nav, toast }) {
  const e = window.MOLI_DATA.emailDraft;
  return (
    <Page title="메일 초안" onBack={() => nav("report")} hasBottomBar
      bottomBar={
        <BottomBar>
          <div className="row gap-8">
            <button className="btn secondary" style={{ flex: 1 }} onClick={() => toast("메일 초안을 복사했습니다.")}>
              <Icon name="copy" size={16}/>
              복사하기
            </button>
            <button className="btn primary" style={{ flex: 1 }} onClick={() => toast("메일 앱을 여는 중...")}>
              <Icon name="mail" size={16} color="#fff"/>
              메일 앱으로 열기
            </button>
          </div>
        </BottomBar>
      }>
      <div className="page-padding">
        <div className="row gap-8" style={{ marginBottom: 12 }}>
          <Badge tone="ai" dot>AI 생성</Badge>
          <Badge tone="info">영문 초안</Badge>
        </div>

        <div className="email-card">
          <div className="head">
            <div className="field"><strong>To</strong> {e.to}</div>
            <div className="field"><strong>From</strong> moli-agent@shinhan.example</div>
            <div className="subject">{e.subject}</div>
          </div>
          <div className="body-pre">{e.body}</div>
        </div>

        <button className="btn ghost" style={{ marginTop: 12, width: "100%", height: 44, justifyContent: "center" }}>
          <Icon name="refresh" size={16}/>
          다시 생성
        </button>

        <div style={{ marginTop: 16, padding: 12, background: "var(--color-info-soft)", borderRadius: 12, fontSize: 12.5, color: "var(--color-navy)", lineHeight: 1.5 }} className="ko">
          <strong style={{ color: "var(--color-info)" }}>안내</strong> · 메일 본문은 영어로 생성되며, 직접 전송 전 내부 검토자 확인이 권장됩니다.
        </div>
        <div className="section-spacer"/>
      </div>
    </Page>
  );
}

// ===== Share Settings =====
function ShareScreen({ nav, toast }) {
  const [perm, setPerm] = useStateB("view");
  const [expiry, setExpiry] = useStateB("7");
  const link = "https://moli.app/r/8f3a-2c4e-bd91";

  const perms = [
    { k: "view", name: "보기 전용", desc: "레포트만 확인할 수 있습니다. 원본 파일은 노출되지 않습니다.", icon: "eye" },
    { k: "recalc", name: "재산정 가능", desc: "체크리스트를 변경해 파생 견적을 만들 수 있습니다. 원본은 변경되지 않습니다.", icon: "edit" },
    { k: "reviewer", name: "내부 검토자", desc: "댓글과 수정 제안을 남길 수 있습니다.", icon: "shield" },
    { k: "external", name: "만료 외부 링크", desc: "외부 공유용. 만료 시 자동 비활성화됩니다.", icon: "external" }
  ];

  return (
    <Page title="공유 설정" onBack={() => nav("report")} hasBottomBar
      bottomBar={<BottomBar><button className="btn primary block" onClick={() => { toast("링크가 복사되었습니다."); }}>
        <Icon name="link" size={16} color="#fff"/>
        링크 만들고 복사
      </button></BottomBar>}>
      <div className="page-padding">
        <div className="card">
          <div className="card-section">
            <div className="card-title">권한</div>
            <div className="col gap-8" style={{ marginTop: 4 }}>
              {perms.map(p => (
                <button key={p.k} className={"permission-row" + (perm === p.k ? " selected" : "")} onClick={() => setPerm(p.k)} style={{ marginTop: 0 }}>
                  <div className="radio"/>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div className="row gap-8" style={{ alignItems: "center", marginBottom: 4 }}>
                      <Icon name={p.icon} size={16} color="var(--color-text-muted)"/>
                      <div className="name">{p.name}</div>
                    </div>
                    <div className="desc ko">{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-section">
            <div className="card-title">만료 기간</div>
            <div className="seg-control">
              {[
                { k: "1", l: "1일" },
                { k: "7", l: "7일" },
                { k: "30", l: "30일" },
                { k: "custom", l: "직접 설정" }
              ].map(o => (
                <button key={o.k} className={expiry === o.k ? "active" : ""} onClick={() => setExpiry(o.k)}>{o.l}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-section">
            <div className="card-title">공유 링크</div>
            <div className="row gap-8" style={{ padding: 12, background: "#fafbfc", border: "1px solid var(--color-border)", borderRadius: 12 }}>
              <Icon name="link" size={16} color="var(--color-text-muted)"/>
              <div style={{ flex: 1, fontSize: 13, color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "Inter, system-ui" }}>{link}</div>
              <button className="btn ghost sm" onClick={() => toast("링크가 복사되었습니다.")} style={{ padding: "0 8px" }}>
                <Icon name="copy" size={14}/>
              </button>
            </div>
            <div className="row gap-8" style={{ alignItems: "flex-start", marginTop: 4 }}>
              <Icon name="shield" size={14} color="var(--color-text-muted)"/>
              <div className="ko" style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.55 }}>
                공유 링크는 원본 분석을 직접 수정하지 않습니다.
                재산정 결과는 별도 파생 버전으로 저장됩니다.
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12, padding: 14 }}>
          <div className="row between">
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-navy)" }}>접속 로그</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>마지막 7일간 접속 이력</div>
            </div>
            <Icon name="chevron-right" size={18} color="var(--color-text-subtle)"/>
          </div>
        </div>
        <div className="section-spacer"/>
      </div>
    </Page>
  );
}

Object.assign(window, { ChecklistScreen, PackagesScreen, ReportScreen, EmailScreen, ShareScreen });
