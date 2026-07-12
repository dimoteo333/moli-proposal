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
    <>
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
    </Page>

    {/* Drawer는 Page(스크롤 영역) 밖, 폰 프레임 레벨에 렌더해야
        닫힘 상태(translateY 100%)가 스크롤 콘텐츠에 딸려 올라오지 않는다 */}
    <Drawer open={!!evidenceItem} onClose={() => setEvidenceItem(null)} title="산정 근거">
      {evidenceItem && <EvidenceContent req={evidenceItem}/>}
    </Drawer>
    </>
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
                  <div className="col" style={{ background: "#fbfaff", borderRadius: 12, padding: "8px 12px", border: "1px solid var(--color-border)" }}>
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
              <div className="ko" style={{ marginTop: 12, padding: 10, background: selected === k ? "var(--color-primary-soft)" : "#fbfaff", borderRadius: 10, fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
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

// WBS 데이터 — 화면 미리보기와 PDF 출력이 공유한다
const REPORT_WBS_ROWS = [
  ["1. 착수 및 아키텍처 설계", "M1–M2", "PM, Architect"],
  ["2. 핵심 콘솔 및 인증 구축", "M2–M5", "Frontend, Backend"],
  ["3. AI 이벤트 모델 PoC", "M3–M6", "Data, Architect"],
  ["4. 인프라 및 CSAP 환경 구성", "M3–M7", "Infra, Security"],
  ["5. 이력 데이터 이관 (ETL)", "M5–M9", "Data, Backend"],
  ["6. 통합 및 테스트", "M8–M11", "QA, Backend"],
  ["7. 파일럿 및 안정화", "M11–M13", "All"],
  ["8. 교육 및 인수인계", "M13–M14", "PM, QA"]
];

// 전체 레포트를 인쇄용 HTML로 구성한다.
// 새 창에서 브라우저 인쇄 대화상자를 띄우고, 사용자가 "PDF로 저장"을 선택하면
// 별도 라이브러리 없이 한글 폰트가 완벽한 PDF가 저장된다.
function buildReportPrintHtml(data) {
  const p = data.project;
  const r = data.report;
  const today = new Date().toLocaleDateString("ko-KR");
  const estimateRows = r.estimateRows
    .map(([label, value]) => `<tr><td>${label}</td><td class="num">${value}</td></tr>`)
    .join("");
  const wbsRows = REPORT_WBS_ROWS
    .map(([task, period, roles]) => `<tr><td>${task}<div class="sub">${roles}</div></td><td class="num">${period}</td></tr>`)
    .join("");
  const riskItems = r.risksKO
    .map((risk, i) => `<li><strong>${i + 1}.</strong> ${risk}</li>`)
    .join("");

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${p.title} — 제안 검토 보고서</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif;
    color: #262440; margin: 0; font-size: 12.5px; line-height: 1.65;
    word-break: keep-all;
  }
  .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
  .brand img { width: 28px; height: 28px; border-radius: 8px; }
  .brand .name { font-weight: 700; font-size: 13px; color: #6b4eff; }
  .brand .meta { margin-left: auto; font-size: 11px; color: #6d6a8a; }
  h1 { font-size: 21px; letter-spacing: -0.02em; line-height: 1.35; margin: 0 0 4px; color: #14122b; }
  .agency { color: #6d6a8a; font-size: 13px; margin-bottom: 24px; }
  h2 {
    font-size: 14.5px; color: #14122b; margin: 26px 0 8px; padding-bottom: 6px;
    border-bottom: 2px solid #6b4eff; letter-spacing: -0.01em;
  }
  p { margin: 0 0 10px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  td { padding: 7px 4px; border-bottom: 1px solid #e9e6f4; vertical-align: top; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; white-space: nowrap; color: #14122b; }
  td .sub { font-size: 11px; color: #6d6a8a; margin-top: 1px; }
  tr.total td { border-top: 2px solid #14122b; border-bottom: none; font-weight: 700; color: #14122b; }
  ul { margin: 6px 0; padding-left: 4px; list-style: none; }
  ul li { margin-bottom: 8px; }
  .footer {
    margin-top: 36px; padding-top: 12px; border-top: 1px solid #e9e6f4;
    font-size: 10.5px; color: #9d9ab8; display: flex; justify-content: space-between;
  }
  section { break-inside: avoid; }
</style>
</head>
<body>
  <div class="brand">
    <img src="${location.origin}/assets/logo.png" alt="">
    <span class="name">몰리 공공제안 에이전트</span>
    <span class="meta">생성일 ${today} · Medium 패키지 기준</span>
  </div>

  <h1>${p.title}</h1>
  <div class="agency">${p.agency} · 제안 검토 보고서</div>

  <section>
    <h2>1. 경영진 요약</h2>
    <p>${r.summaryKO}</p>
    <h2>2. 사업 범위 해석</h2>
    <p>${r.scopeKO}</p>
    <h2>3. 입찰 권고</h2>
    <p><strong>Medium 패키지</strong>로의 제안을 권고합니다. AI 이벤트 분류 모듈과 운영 KPI 대시보드는 기존 SI 경쟁사 대비 차별화 가치를 확보할 수 있으며, ${p.contractPeriodMonths}개월 사업기간 내 안정적 납품이 가능합니다.</p>
  </section>

  <section>
    <h2>4. 공수 산정 — 42.5 MM</h2>
    <p>신뢰도 78% 기준 범위는 35.0–52.0 MM입니다. 요구사항 기반 Bottom-up (60%), KOSA 가이드 참조 (25%), 발주 예산 역산 (15%)을 가중 조합하여 산출하였습니다.</p>
    <table>
      ${estimateRows}
      <tr class="total"><td>합계</td><td class="num">42.5 MM</td></tr>
    </table>
  </section>

  <section>
    <h2>5. WBS · 납품 계획 (${p.contractPeriodMonths}개월)</h2>
    <table>${wbsRows}</table>
  </section>

  <section>
    <h2>6. 주요 리스크 및 대응</h2>
    <ul>${riskItems}</ul>
    <p><strong>발주처 확인 요청:</strong> (1) 이관 대상 비정형 이력 로그의 규모와 형태, (2) AI 이벤트 분류 모델의 정량 평가 기준 — 제안 확정 전 명확화를 권장합니다.</p>
  </section>

  <div class="footer">
    <span>© 2026 Shinhan Bank · MOLI Public Proposal Agent</span>
    <span>본 보고서는 몰리가 생성한 검토 초안입니다</span>
  </div>
</body>
</html>`;
}

function downloadReportPdf(toast) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast("팝업 차단을 해제한 뒤 다시 시도해 주세요.");
    return;
  }
  printWindow.document.write(buildReportPrintHtml(window.MOLI_DATA));
  printWindow.document.close();
  printWindow.focus();
  // 로고 이미지·폰트 렌더가 끝난 뒤 인쇄 대화상자를 연다
  printWindow.onload = () => setTimeout(() => printWindow.print(), 200);
  toast("인쇄 대화상자에서 'PDF로 저장'을 선택하세요.");
}

function ReportScreen({ nav, toast }) {
  const data = window.MOLI_DATA;
  const [section, setSection] = useStateB(0);
  const sections = ["요약", "공수 산정", "WBS", "리스크"];

  return (
    <Page title="레포트 미리보기" onBack={() => nav("checklist")} hasBottomBar
      right={<>
        <button className="icon-btn" aria-label="PDF 다운로드" onClick={() => downloadReportPdf(toast)}><Icon name="down" size={20}/></button>
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
            발주처 제출용 한글 레포트로 생성되었습니다. 본문은 직접 편집 가능합니다.
          </div>
        </div>

        <div className="report-doc ko">
          {section === 0 && (
            <>
              <div className="small-label">EXECUTIVE SUMMARY · 요약</div>
              <h2 style={{ marginTop: 0 }}>도시철도 통합관제 플랫폼 고도화 — RFP 검토 보고</h2>
              <p>{data.report.summaryKO}</p>

              <h2>사업 범위 해석</h2>
              <p>{data.report.scopeKO}</p>

              <h2>입찰 권고</h2>
              <p><strong>Medium 패키지</strong>로의 제안을 권고합니다. AI 이벤트 분류 모듈과 운영 KPI 대시보드는 기존 SI 경쟁사 대비 차별화 가치를 확보할 수 있으며, 14개월 사업기간 내 안정적 납품이 가능합니다.</p>
            </>
          )}
          {section === 1 && (
            <>
              <div className="small-label">EFFORT ESTIMATE · 공수 산정</div>
              <h2 style={{ marginTop: 0 }}>예상 공수 — 42.5 MM</h2>
              <p>신뢰도 78% 기준 범위는 35.0–52.0 MM입니다. 산정은 RFP 요구사항 기반 견적, KOSA 가이드 가정, ISBSG 생산성 범위를 종합하여 수행되었습니다. 발주 예산 역산 결과 MM 단가는 KRW 11–13M 구간으로 추정됩니다.</p>
              <div style={{ marginTop: 16 }}>
                {data.report.estimateRows.map((r, i) => (
                  <div key={i} className="estimate-row">
                    <span className="label">{r[0]}</span>
                    <span className="val">{r[1]}</span>
                  </div>
                ))}
                <div className="estimate-row" style={{ borderTop: "2px solid var(--color-navy)", borderBottom: "none", marginTop: 4, paddingTop: 10 }}>
                  <span className="label" style={{ color: "var(--color-navy)", fontWeight: 700 }}>합계</span>
                  <span className="val" style={{ fontSize: 15 }}>42.5 MM</span>
                </div>
              </div>
              <h2>산정 방법론</h2>
              <p>세 가지 추정 계층을 가중 조합하여 산출하였습니다: 요구사항 기반 Bottom-up (60%), KOSA 가이드 참조 (25%), 발주 예산 역산 (15%). 사내 실적 데이터 보정은 적용되지 않았습니다 — 현재 데이터셋에 비교 가능한 내부 사례가 존재하지 않습니다.</p>
            </>
          )}
          {section === 2 && (
            <>
              <div className="small-label">WBS · 작업 분할 구조</div>
              <h2 style={{ marginTop: 0 }}>납품 계획 (14개월)</h2>
              <div style={{ marginTop: 12 }}>
                {REPORT_WBS_ROWS.map((row, i) => (
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
              <div className="small-label">RISK &amp; MITIGATION · 리스크</div>
              <h2 style={{ marginTop: 0 }}>주요 리스크</h2>
              {data.report.risksKO.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 2 ? "1px solid var(--color-border)" : "none", alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 7, background: "var(--color-warning-soft)", color: "var(--color-warning)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, fontSize: 12
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 13.5, color: "var(--color-text)", lineHeight: 1.55 }}>{r}</div>
                </div>
              ))}
              <h2>발주처 확인 요청 항목</h2>
              <p>두 가지 RFP 항목이 모호한 상태입니다: (1) 이관 대상 비정형 이력 로그의 규모와 형태, (2) AI 이벤트 분류 모델의 정량 평가 기준. 제안 확정 전 발주처에 명확화를 요청할 것을 권장합니다.</p>
            </>
          )}
        </div>

        <div className="row gap-8" style={{ marginTop: 16 }}>
          <button className="btn secondary" style={{ flex: 1 }} onClick={() => toast("이 섹션을 복사했습니다.")}>
            <Icon name="copy" size={14}/>
            섹션 복사
          </button>
          <button className="btn secondary" style={{ flex: 1 }} onClick={() => downloadReportPdf(toast)}>
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
          <Badge tone="info">한글 초안</Badge>
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
          <strong style={{ color: "var(--color-info)" }}>안내</strong> · 메일 본문은 발주처 검토자 보고용 한글 초안으로 생성됩니다. 직접 전송 전 내부 검토자 확인을 권장합니다.
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
            <div className="row gap-8" style={{ padding: 12, background: "#fbfaff", border: "1px solid var(--color-border)", borderRadius: 12 }}>
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
