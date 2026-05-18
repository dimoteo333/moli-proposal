const app = document.querySelector("#app");

const state = {
  screen: "home",
  loading: false,
  analysisId: null,
  analysis: null,
  estimate: null,
  report: null,
  share: null,
  selectedPackage: "M",
  filter: "all",
  drawer: null,
  stages: []
};

const STAGES = ["파일 업로드", "문서 형식 확인", "본문 추출", "요구사항 정리", "공수 산정", "레포트 준비"];

render();

function setState(next) {
  Object.assign(state, next);
  render();
}

function shell(title, body, bottom = "") {
  return `
    <main class="phone-frame">
      ${title ? `
        <header class="app-bar">
          <button class="back-btn" type="button" aria-label="뒤로가기" data-action="back">‹</button>
          <h2>${title}</h2>
          <button class="icon-btn" type="button" aria-label="메뉴" data-screen="admin">☰</button>
        </header>
      ` : ""}
      <section class="screen">${body}</section>
      ${bottom}
      ${state.drawer ? renderDrawer() : ""}
    </main>
  `;
}

function render() {
  if (state.screen === "home") {
    app.innerHTML = shell("", homeScreen());
  } else if (state.screen === "new") {
    app.innerHTML = shell("새 분석", newAnalysisScreen(), bottom(`<button class="btn primary block" type="button" data-action="run">분석 시작</button>`));
  } else if (state.screen === "upload") {
    app.innerHTML = shell("문서 분석 중", uploadScreen());
  } else if (state.screen === "summary") {
    app.innerHTML = shell("분석 결과", summaryScreen(), bottom(`
      <div class="row">
        <button class="btn secondary block" type="button" data-screen="checklist">공수 산정</button>
        <button class="btn primary block" type="button" data-screen="report">레포트 생성</button>
      </div>
    `));
  } else if (state.screen === "checklist") {
    app.innerHTML = shell("공수 산정", checklistScreen(), bottom(`
      <div class="row between">
        <strong>${state.analysis?.estimation?.totalMM?.recommended?.toFixed(1) || "0.0"} MM · ${state.selectedPackage}</strong>
      </div>
      <div class="row" style="margin-top:10px">
        <button class="btn secondary block" type="button" data-screen="packages">패키지 비교</button>
        <button class="btn primary block" type="button" data-screen="report">레포트 생성</button>
      </div>
    `));
  } else if (state.screen === "packages") {
    app.innerHTML = shell("패키지 비교", packagesScreen(), bottom(`<button class="btn primary block" type="button" data-screen="report">레포트 생성</button>`));
  } else if (state.screen === "report") {
    app.innerHTML = shell("레포트 미리보기", reportScreen(), bottom(`
      <div class="row">
        <button class="btn secondary block" type="button" data-screen="email">메일 초안</button>
        <button class="btn primary block" type="button" data-screen="share">공유하기</button>
      </div>
    `));
  } else if (state.screen === "email") {
    app.innerHTML = shell("메일 초안", emailScreen(), bottom(`<button class="btn primary block" type="button" data-action="copy-email">복사하기</button>`));
  } else if (state.screen === "share") {
    app.innerHTML = shell("공유 설정", shareScreen(), bottom(`<button class="btn primary block" type="button" data-action="share">공유 링크 만들기</button>`));
  } else if (state.screen === "admin") {
    app.innerHTML = shell("관리자 설정", adminScreen());
  }

  bindEvents();
}

function homeScreen() {
  return `
    <div class="page-padding">
      <div class="brand-row">
        <img src="/logo.ico" alt="" class="brand-icon">
        <div>
          <p class="eyebrow">MOLI</p>
          <h1>몰리 공공제안 에이전트</h1>
        </div>
      </div>
      <div class="hero">
        <p>공공 RFP를 업로드하면,</p>
        <strong>공수·제안 아이템·WBS를 근거와 함께 산출합니다.</strong>
        <button class="btn primary block" type="button" data-screen="new" style="margin-top:18px;background:#fff;color:var(--color-primary)">새 분석 시작</button>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="row between">
          <h3>최근 분석</h3>
          <span class="badge primary">공유됨</span>
        </div>
        <p class="meta">도시 통합 민원 포털 재구축 · 42.5 MM · Medium</p>
      </div>
      <div class="card" style="margin-top:12px">
        <h3>하네스 기반 검증</h3>
        <p class="helper">파서, 추출, 산정, 패키지, 레포트, 공유 흐름을 고정 샘플로 반복 검증합니다.</p>
      </div>
    </div>
  `;
}

function newAnalysisScreen() {
  return `
    <div class="page-padding list-gap">
      <div class="card">
        <label class="label" for="notice-url">공고문 URL</label>
        <p class="helper">나라장터 또는 공공기관 입찰공고 URL을 입력하세요.</p>
        <input id="notice-url" class="input" value="https://www.g2b.go.kr/sample-notice">
      </div>
      <div class="card">
        <h3>RFP 문서 업로드</h3>
        <p class="helper">HWP, HWPX, DOCX, PDF 대신 하네스 샘플을 사용해 전체 흐름을 검증합니다.</p>
        <span class="badge success">sample-public-si-rfp.md</span>
      </div>
      <div class="card">
        <label class="label" for="analysis-mode">분석 방식</label>
        <select id="analysis-mode" class="select">
          <option value="quick">빠른 검토</option>
          <option value="standard" selected>표준 분석</option>
          <option value="detailed">상세 산정</option>
        </select>
      </div>
    </div>
  `;
}

function uploadScreen() {
  return `
    <div class="page-padding">
      <div class="card">
        <h3>RFP 문서를 분석하고 있습니다</h3>
        <p class="helper">근거 앵커와 요구사항 구조를 함께 생성합니다.</p>
      </div>
      <div class="timeline" style="margin-top:12px">
        ${STAGES.map((stage) => `<div class="${state.stages.includes(stage) ? "done" : ""}">${stage}</div>`).join("")}
      </div>
    </div>
  `;
}

function summaryScreen() {
  const analysis = state.analysis;
  if (!analysis) return loadingCard();
  const total = analysis.estimation.totalMM;
  return `
    <div class="page-padding list-gap">
      <div class="card">
        <span class="badge primary">${analysis.packageSummary.recommendedPackage} 패키지 권장</span>
        <h3 style="margin-top:10px">${analysis.project.title}</h3>
        <p class="helper">${analysis.project.agency} · ${analysis.project.contractPeriodMonths}개월 · ${formatKRW(analysis.project.budgetKRW)}</p>
      </div>
      <div class="summary-grid">
        <div class="metric"><span class="helper">예상 공수</span><div class="value">${total.recommended.toFixed(1)} MM</div></div>
        <div class="metric"><span class="helper">신뢰도</span><div class="value">${analysis.estimation.confidenceScore}%</div></div>
        <div class="metric"><span class="helper">요구사항</span><div class="value">${analysis.requirements.length}개</div></div>
        <div class="metric"><span class="helper">예산 적정성</span><div class="value">${analysis.estimation.budgetAdequacyScore}</div></div>
      </div>
      <div class="card">
        <h3>AI 검토 의견</h3>
        <p class="helper">Medium 기준 제안 검토를 권장하며, 낮은 신뢰도 항목은 발주처 질의로 확정해야 합니다.</p>
      </div>
    </div>
  `;
}

function checklistScreen() {
  const analysis = state.analysis;
  if (!analysis) return loadingCard();
  const filters = ["전체", "필수", "기능", "인프라", "보안", "제안 아이템", "검토 필요"];
  const filtered = analysis.requirements.filter((item) => {
    if (state.filter === "전체") return true;
    if (state.filter === "필수") return item.mandatory;
    if (state.filter === "기능") return item.type === "functional";
    if (state.filter === "인프라") return item.type === "infrastructure";
    if (state.filter === "보안") return item.type === "security";
    if (state.filter === "제안 아이템") return item.type === "proposal_item";
    if (state.filter === "검토 필요") return item.aiRecommendation === "human_review";
    return true;
  });

  return `
    <div class="seg">
      ${["S", "M", "L"].map((key) => `<button type="button" class="${state.selectedPackage === key ? "active" : ""}" data-package="${key}">${analysis.packages[key].name}</button>`).join("")}
    </div>
    <div class="chip-row">
      ${filters.map((filter) => `<button type="button" class="chip ${state.filter === filter ? "active" : ""}" data-filter="${filter}">${filter}</button>`).join("")}
    </div>
    <div class="page-padding list-gap">
      ${filtered.map(requirementCard).join("")}
      <button class="btn secondary block" type="button">제안 아이템 직접 추가</button>
    </div>
  `;
}

function requirementCard(item) {
  return `
    <article class="card requirement">
      <button class="check ${item.included ? "on" : ""}" type="button" aria-label="${escapeHtml(item.title)} 포함 여부" data-toggle="${item.id}"></button>
      <div>
        <div class="row between">
          <h3>${escapeHtml(item.title)}</h3>
          <strong>${item.estimatedMM.recommended.toFixed(1)} MM</strong>
        </div>
        <p class="helper">${typeLabel(item.type)} · 신뢰도 ${Math.round(item.confidence * 100)}% · ${riskLabel(item.riskLevel)}</p>
        <div class="row" style="flex-wrap:wrap">
          <span class="badge ${item.mandatory ? "primary" : "ai"}">${item.mandatory ? "필수" : "선택"}</span>
          <span class="badge ${item.aiRecommendation === "human_review" ? "warning" : "success"}">${recommendationLabel(item.aiRecommendation)}</span>
          <button class="btn secondary" type="button" data-evidence="${item.id}">근거 보기</button>
        </div>
      </div>
    </article>
  `;
}

function packagesScreen() {
  const analysis = state.analysis;
  if (!analysis) return loadingCard();
  return `
    <div class="page-padding list-gap">
      ${Object.values(analysis.packages).map((pkg) => `
        <button class="card card-button" type="button" data-package="${pkg.key}">
          <div class="row between">
            <h3>${pkg.name}</h3>
            <span class="badge ${pkg.key === analysis.packageSummary.recommendedPackage ? "primary" : ""}">${pkg.tagline}</span>
          </div>
          <p class="helper">${pkg.totalMM.recommended.toFixed(1)} MM · 요구사항 ${pkg.requirementCount}개 · 제안 아이템 ${pkg.proposalItemCount}개</p>
          <p class="helper">${riskLabel(pkg.riskLevel)} · 신뢰도 ${pkg.confidence}% · ${pkg.recommendedStaffing}</p>
        </button>
      `).join("")}
    </div>
  `;
}

function reportScreen() {
  if (!state.report) return loadingCard();
  return `
    <div class="page-padding list-gap">
      <div class="card">
        <div class="row between">
          <h3>요약</h3>
          <button class="btn secondary" type="button" data-action="copy-report">복사</button>
        </div>
      </div>
      <article class="card report-body">${escapeHtml(state.report.markdown)}</article>
    </div>
  `;
}

function emailScreen() {
  if (!state.report) return loadingCard();
  return `
    <div class="page-padding list-gap">
      <div class="card">
        <span class="label">제목</span>
        <p>${escapeHtml(state.report.emailDraft.subject)}</p>
      </div>
      <div class="card">
        <span class="label">본문</span>
        <div class="report-body">${escapeHtml(state.report.emailDraft.body)}</div>
      </div>
      <button class="btn secondary block" type="button">메일 앱으로 열기</button>
      <button class="btn secondary block" type="button">다시 생성</button>
    </div>
  `;
}

function shareScreen() {
  return `
    <div class="page-padding list-gap">
      <div class="card">
        <h3>권한 선택</h3>
        <p class="helper">공유 링크는 원본 분석을 직접 수정하지 않습니다. 재산정 결과는 별도 버전으로 저장됩니다.</p>
        <div class="list-gap">
          <button class="card card-button" type="button"><strong>보기 전용</strong><p class="helper">레포트만 확인할 수 있습니다.</p></button>
          <button class="card card-button" type="button"><strong>재산정 가능</strong><p class="helper">체크리스트를 변경해 파생 견적을 만들 수 있습니다.</p></button>
          <button class="card card-button" type="button"><strong>내부 검토자</strong><p class="helper">댓글과 수정 제안을 남길 수 있습니다.</p></button>
        </div>
      </div>
      <div class="card">
        <label class="label" for="expiry">만료일</label>
        <select id="expiry" class="select">
          <option>1일</option>
          <option selected>7일</option>
          <option>30일</option>
        </select>
      </div>
      ${state.share ? `<div class="card"><span class="badge success">공유 링크 생성됨</span><p class="helper">${state.share.url}</p></div>` : ""}
    </div>
  `;
}

function adminScreen() {
  return `
    <div class="page-padding list-gap">
      <div class="card">
        <h3>관리자 설정</h3>
        <p class="helper">과거 프로젝트 데이터와 산정 기준표를 버전으로 관리하는 영역입니다.</p>
      </div>
      <div class="card">
        <h3>과거 프로젝트 데이터</h3>
        <p class="helper">익명화 여부, 실제 투입 공수, 도메인 태그, 제외 여부를 관리합니다.</p>
      </div>
      <div class="card">
        <h3>산정 기준표</h3>
        <p class="helper">MOLI-2026.1 기준표가 현재 하네스에 적용되어 있습니다.</p>
      </div>
    </div>
  `;
}

function renderDrawer() {
  const item = state.drawer;
  const evidence = item.evidenceRefs
    .map((id) => state.analysis.evidence.find((entry) => entry.id === id))
    .filter(Boolean);
  return `
    <aside class="drawer" role="dialog" aria-modal="true" aria-label="산정 근거">
      <div class="row between">
        <h3>산정 근거</h3>
        <button class="icon-btn" type="button" aria-label="닫기" data-action="close-drawer">×</button>
      </div>
      <p class="helper">${escapeHtml(item.title)}</p>
      ${evidence.length ? evidence.map((entry) => `
        <div class="card">
          <span class="badge primary">${entry.sourceFileName} · ${entry.section}</span>
          <p>${escapeHtml(entry.quote)}</p>
        </div>
      `).join("") : `<div class="card"><p class="helper">원문 근거가 없는 사용자/AI 제안 아이템입니다.</p></div>`}
    </aside>
  `;
}

function bottom(content) {
  return `<div class="bottom-bar">${content}</div>`;
}

function loadingCard() {
  return `<div class="page-padding"><div class="card"><h3>처리 중</h3><p class="helper">잠시만 기다려 주세요.</p></div></div>`;
}

function bindEvents() {
  app.querySelectorAll("[data-screen]").forEach((element) => {
    element.addEventListener("click", () => setState({ screen: element.dataset.screen }));
  });
  app.querySelectorAll("[data-action='back']").forEach((element) => {
    element.addEventListener("click", () => setState({ screen: previousScreen() }));
  });
  app.querySelectorAll("[data-action='run']").forEach((element) => {
    element.addEventListener("click", runAnalysis);
  });
  app.querySelectorAll("[data-action='share']").forEach((element) => {
    element.addEventListener("click", createShare);
  });
  app.querySelectorAll("[data-action='close-drawer']").forEach((element) => {
    element.addEventListener("click", () => setState({ drawer: null }));
  });
  app.querySelectorAll("[data-evidence]").forEach((element) => {
    element.addEventListener("click", () => {
      const item = state.analysis.requirements.find((requirement) => requirement.id === element.dataset.evidence);
      setState({ drawer: item });
    });
  });
  app.querySelectorAll("[data-filter]").forEach((element) => {
    element.addEventListener("click", () => setState({ filter: element.dataset.filter }));
  });
  app.querySelectorAll("[data-package]").forEach((element) => {
    element.addEventListener("click", () => setState({ selectedPackage: element.dataset.package }));
  });
  app.querySelectorAll("[data-toggle]").forEach((element) => {
    element.addEventListener("click", () => toggleRequirement(element.dataset.toggle));
  });
  app.querySelectorAll("[data-action='copy-report']").forEach((element) => {
    element.addEventListener("click", () => navigator.clipboard?.writeText(state.report.markdown));
  });
  app.querySelectorAll("[data-action='copy-email']").forEach((element) => {
    element.addEventListener("click", () => navigator.clipboard?.writeText(state.report.emailDraft.body));
  });
}

async function runAnalysis() {
  setState({ screen: "upload", stages: [] });
  const created = await api("/api/analysis", {
    sourceUrl: document.querySelector("#notice-url")?.value || "https://www.g2b.go.kr/sample-notice",
    analysisMode: document.querySelector("#analysis-mode")?.value || "standard",
    projectCategory: "공공 SI"
  });
  state.analysisId = created.analysisId;
  await markStage("파일 업로드");
  await api(`/api/analysis/${created.analysisId}/files`, { fixture: "sample-public-si-rfp.md" });
  await markStage("문서 형식 확인");
  await api(`/api/analysis/${created.analysisId}/parse`, {});
  await markStage("본문 추출");
  await api(`/api/analysis/${created.analysisId}/extract`, {});
  await markStage("요구사항 정리");
  const estimate = await api(`/api/analysis/${created.analysisId}/estimate`, {});
  state.estimate = estimate;
  await markStage("공수 산정");
  const report = await api(`/api/analysis/${created.analysisId}/report`, {});
  state.report = report;
  await markStage("레포트 준비");
  state.analysis = await (await fetch(`/api/analysis/${created.analysisId}`)).json();
  setState({ screen: "summary" });
}

async function toggleRequirement(id) {
  const current = state.analysis.requirements.find((item) => item.id === id);
  await api(`/api/analysis/${state.analysis.id}/requirements/${id}`, { included: !current.included }, "PATCH");
  state.analysis = await (await fetch(`/api/analysis/${state.analysis.id}`)).json();
  setState({ drawer: null });
}

async function createShare() {
  const share = await api(`/api/analysis/${state.analysis.id}/share`, {
    permission: "editable_recalculation",
    expiresInDays: 7
  });
  setState({ share });
}

async function markStage(stage) {
  await new Promise((resolve) => setTimeout(resolve, 120));
  state.stages = [...state.stages, stage];
  render();
}

async function api(path, body, method = "POST") {
  const response = await fetch(path, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function previousScreen() {
  const map = {
    new: "home",
    upload: "new",
    summary: "home",
    checklist: "summary",
    packages: "checklist",
    report: "summary",
    email: "report",
    share: "report",
    admin: "home"
  };
  return map[state.screen] || "home";
}

function typeLabel(type) {
  return {
    functional: "기능",
    non_functional: "비기능",
    security: "보안",
    infrastructure: "인프라",
    migration: "데이터 이관",
    proposal_item: "제안 아이템",
    documentation: "문서화"
  }[type] || type;
}

function recommendationLabel(value) {
  return {
    strong_recommend: "강력 추천",
    recommend: "추천",
    optional: "선택",
    not_recommend: "비추천",
    human_review: "검토 필요"
  }[value] || "선택";
}

function riskLabel(value) {
  return value === "high" ? "리스크 높음" : value === "medium" ? "리스크 보통" : "리스크 낮음";
}

function formatKRW(value) {
  return Number.isFinite(value) ? `${value.toLocaleString("ko-KR")}원` : "확인 필요";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}
