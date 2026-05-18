// Mock data for MOLI Public Proposal Agent prototype.
// Note: realistic-feeling Korean public-sector RFP analysis sample.

window.MOLI_DATA = (() => {
  const project = {
    title: "도시철도 통합관제 플랫폼 고도화 및 AI 운영지원 시스템 구축",
    agency: "한국교통공단",
    budgetKRW: 4_280_000_000,
    contractPeriodMonths: 14,
    bidMethod: "협상에 의한 계약 (제안서 평가)",
    proposalDeadline: "2026-06-12",
    businessDomain: "교통/SOC",
    projectType: "시스템 구축 + AI 도입",
    sourceFileName: "제안요청서_도시철도통합관제_2026.hwpx"
  };

  const evidence = {
    e1: {
      source: "제안요청서_도시철도통합관제_2026.hwpx · p.12",
      quote: "통합 관제 화면을 구축하고, 권한별 접근 제어를 제공해야 한다. 사용자 그룹은 운영자, 관제사, 관리자로 구분하며 감사 로그를 1년 이상 보존한다.",
      parser: "hwpx",
      confidence: 0.86,
      basis: [
        ["기능 복잡도", "Medium"],
        ["기본 공수", "3.0 MM"],
        ["권한·감사 보정", "+1.0 MM"],
        ["테스트/문서화", "+0.5 MM"]
      ]
    },
    e2: {
      source: "제안요청서_도시철도통합관제_2026.hwpx · p.18, p.34",
      quote: "관제 운영 중 발생하는 이벤트를 AI 모델로 분류·예측하여 관제사에게 권고 액션을 제시한다. 모델은 자체 운영 가능한 형태로 납품되어야 한다.",
      parser: "hwpx",
      confidence: 0.74,
      basis: [
        ["기능 복잡도", "High"],
        ["기본 공수", "6.5 MM"],
        ["모델 학습·검증", "+2.0 MM"],
        ["MLOps/배포", "+1.5 MM"]
      ]
    },
    e3: {
      source: "제안요청서_도시철도통합관제_2026.hwpx · p.24",
      quote: "주요 인프라는 공공 클라우드(국정원 CSAP 인증) 기준으로 구성하며, 무중단 이중화를 갖춰야 한다.",
      parser: "hwpx",
      confidence: 0.81,
      basis: [
        ["대상", "공공 클라우드 (CSAP)"],
        ["이중화 구성", "Active-Active"],
        ["기본 인프라 공수", "3.2 MM"]
      ]
    },
    e4: {
      source: "제안요청서_도시철도통합관제_2026.hwpx · p.31",
      quote: "기존 운영 시스템의 이력 데이터(약 4년치)를 신규 플랫폼으로 이관해야 하며, 일부 비정형 로그 데이터 포함.",
      parser: "hwpx",
      confidence: 0.58,
      basis: [
        ["데이터 규모", "추정 불명확"],
        ["기본 공수", "3.5 MM"],
        ["비정형 로그 ETL", "+1.5 MM"],
        ["검토 사유", "이관 대상 건수 미명시"]
      ]
    },
    e5: {
      source: "제안요청서_도시철도통합관제_2026.hwpx · p.40",
      quote: "보안 점검 결과는 분기별 보고하며, 주요 보안 사고에 대한 대응 시나리오를 사전에 제시한다.",
      parser: "hwpx",
      confidence: 0.83,
      basis: [
        ["보안 운영 범위", "분기 점검 + 사고 대응"],
        ["연간 환산 공수", "2.0 MM"]
      ]
    },
    e6: {
      source: "제안요청서_도시철도통합관제_2026.hwpx · p.45",
      quote: "운영자 교육은 최소 2회 진행하며 교육 자료는 한글로 작성한다.",
      parser: "hwpx",
      confidence: 0.91,
      basis: [
        ["교육 회차", "2회"],
        ["기본 공수", "1.0 MM"]
      ]
    },
    e7: {
      source: "공고문 (나라장터)",
      quote: "사업기간 14개월, 사업금액 4,280,000,000원, 협상에 의한 계약",
      parser: "metadata",
      confidence: 0.95,
      basis: [
        ["발주 예산", "4.28B KRW"],
        ["기간", "14 개월"],
        ["KOSA 단가 가정", "12.5M KRW/MM"]
      ]
    }
  };

  // Roles & colors
  const ROLES = [
    { key: "pm", label: "PM", color: "#0046ff" },
    { key: "architect", label: "Architect", color: "#7a5af8" },
    { key: "backend", label: "Backend", color: "#1570ef" },
    { key: "frontend", label: "Frontend", color: "#06aed4" },
    { key: "data", label: "Data", color: "#16b364" },
    { key: "infra", label: "Infra", color: "#dc6803" },
    { key: "security", label: "Security", color: "#d92d20" },
    { key: "qa", label: "QA", color: "#98a2b3" }
  ];

  // Each requirement has: included flags per package (S, M, L)
  const requirements = [
    {
      id: "r1",
      title: "통합 관제 대시보드 및 권한 관리",
      type: "기능",
      mandatory: true,
      mm: { min: 3.5, recommended: 4.5, max: 6.0 },
      role: { pm: 0.4, architect: 0.4, backend: 1.6, frontend: 1.4, data: 0.0, infra: 0.0, security: 0.3, qa: 0.4 },
      confidence: 0.86,
      risk: "low",
      recommendation: "strong",
      reason: "필수 요구사항이며 평가표 정량 점수 항목과 직접 연결됨. 권한 모델은 보안 요구 5.2.3과 통합 설계 필요.",
      evidence: ["e1"],
      packages: { S: true, M: true, L: true }
    },
    {
      id: "r2",
      title: "AI 기반 이벤트 분류 및 권고 모델",
      type: "기능 · AI",
      mandatory: true,
      mm: { min: 8.0, recommended: 10.0, max: 13.5 },
      role: { pm: 0.6, architect: 1.2, backend: 2.4, frontend: 0.8, data: 3.0, infra: 0.8, security: 0.4, qa: 0.8 },
      confidence: 0.74,
      risk: "medium",
      recommendation: "strong",
      reason: "본 사업의 기술 차별화 항목. 모델 평가 메트릭과 운영 운영 인계 시나리오를 제안서에 명시하면 평가 우위 확보 가능.",
      evidence: ["e2"],
      packages: { S: false, M: true, L: true }
    },
    {
      id: "r3",
      title: "공공 클라우드 이중화 인프라 구성",
      type: "인프라",
      mandatory: true,
      mm: { min: 2.5, recommended: 3.2, max: 4.0 },
      role: { pm: 0.2, architect: 0.5, backend: 0.0, frontend: 0.0, data: 0.0, infra: 2.2, security: 0.3, qa: 0.0 },
      confidence: 0.81,
      risk: "low",
      recommendation: "strong",
      reason: "CSAP 환경 구성은 필수. 인증된 협력사 활용 가능성 점검 필요.",
      evidence: ["e3"],
      packages: { S: true, M: true, L: true }
    },
    {
      id: "r4",
      title: "이력 데이터 이관 및 비정형 로그 ETL",
      type: "데이터 이관",
      mandatory: true,
      mm: { min: 4.0, recommended: 5.0, max: 7.5 },
      role: { pm: 0.3, architect: 0.3, backend: 0.8, frontend: 0.0, data: 2.8, infra: 0.5, security: 0.1, qa: 0.2 },
      confidence: 0.58,
      risk: "high",
      recommendation: "review",
      reason: "이관 대상 데이터 규모와 비정형 로그 정의가 RFP에 명시되지 않음. 사전 질의 또는 가정 명시 권장.",
      evidence: ["e4"],
      packages: { S: true, M: true, L: true }
    },
    {
      id: "r5",
      title: "보안 운영 (분기 점검 · 사고 대응)",
      type: "보안",
      mandatory: true,
      mm: { min: 1.5, recommended: 2.0, max: 2.8 },
      role: { pm: 0.2, architect: 0.0, backend: 0.0, frontend: 0.0, data: 0.0, infra: 0.4, security: 1.4, qa: 0.0 },
      confidence: 0.83,
      risk: "medium",
      recommendation: "recommend",
      reason: "보안관제 협력사 단가에 따라 변동 가능. 연간 계약 단위로 분리 견적 권장.",
      evidence: ["e5"],
      packages: { S: true, M: true, L: true }
    },
    {
      id: "r6",
      title: "운영자 교육 및 매뉴얼",
      type: "교육",
      mandatory: false,
      mm: { min: 0.8, recommended: 1.0, max: 1.4 },
      role: { pm: 0.4, architect: 0.0, backend: 0.0, frontend: 0.0, data: 0.0, infra: 0.0, security: 0.0, qa: 0.6 },
      confidence: 0.91,
      risk: "low",
      recommendation: "recommend",
      reason: "필수 교육 2회 외 추가 권고. 영상 매뉴얼 포함시 평가 가점 가능성.",
      evidence: ["e6"],
      packages: { S: true, M: true, L: true }
    },
    {
      id: "r7",
      title: "실시간 운영 KPI 대시보드 (제안 아이템)",
      type: "제안 아이템",
      mandatory: false,
      mm: { min: 1.5, recommended: 2.0, max: 3.0 },
      role: { pm: 0.2, architect: 0.2, backend: 0.6, frontend: 0.8, data: 0.2, infra: 0.0, security: 0.0, qa: 0.0 },
      confidence: 0.72,
      risk: "low",
      recommendation: "recommend",
      reason: "발주처 운영 부서가 즉시 활용 가능. RFP 명시 없음이나 차별화 가치 높음.",
      evidence: [],
      packages: { S: false, M: true, L: true }
    },
    {
      id: "r8",
      title: "AI 예측 결과 설명 가능성 (XAI) 모듈",
      type: "제안 아이템",
      mandatory: false,
      mm: { min: 2.0, recommended: 3.0, max: 4.5 },
      role: { pm: 0.2, architect: 0.4, backend: 0.6, frontend: 0.4, data: 1.2, infra: 0.0, security: 0.0, qa: 0.2 },
      confidence: 0.68,
      risk: "medium",
      recommendation: "optional",
      reason: "공공 AI 가이드라인 대응 차원. Large 패키지에서만 권장.",
      evidence: [],
      packages: { S: false, M: false, L: true }
    },
    {
      id: "r9",
      title: "운영 데이터 거버넌스 및 품질 관리 (제안 아이템)",
      type: "제안 아이템",
      mandatory: false,
      mm: { min: 2.5, recommended: 3.5, max: 5.0 },
      role: { pm: 0.4, architect: 0.4, backend: 0.4, frontend: 0.0, data: 1.8, infra: 0.0, security: 0.3, qa: 0.2 },
      confidence: 0.65,
      risk: "medium",
      recommendation: "optional",
      reason: "장기 운영 가치는 높지만 단기 평가 영향은 제한적. 발주처 데이터 부서 의지 확인 필요.",
      evidence: [],
      packages: { S: false, M: false, L: true }
    },
    {
      id: "r10",
      title: "사고 대응 자동화 (Runbook + Alert)",
      type: "운영",
      mandatory: false,
      mm: { min: 1.2, recommended: 1.8, max: 2.5 },
      role: { pm: 0.2, architect: 0.2, backend: 0.4, frontend: 0.0, data: 0.0, infra: 0.6, security: 0.4, qa: 0.0 },
      confidence: 0.77,
      risk: "low",
      recommendation: "recommend",
      reason: "운영 효율과 SLA 준수 측면. 큰 비용 없이 추가 가능.",
      evidence: [],
      packages: { S: false, M: true, L: true }
    }
  ];

  const packages = {
    S: {
      key: "S",
      name: "Small",
      tagline: "최소 범위 · 안전한 입찰",
      bestFor: "예산 여유가 낮거나 유지보수 중심의 RFP",
      features: [
        "필수 기능 요구사항만 포함",
        "공공 클라우드 단순 구성",
        "표준 보안 점검 체크리스트",
        "보수적 제안 아이템"
      ],
      risk: "보통",
      confidence: 0.82
    },
    M: {
      key: "M",
      name: "Medium",
      tagline: "균형 제안 · 경쟁력 확보",
      bestFor: "일반 경쟁 입찰 · 적정 예산 · 차별화 필요",
      features: [
        "필수 + 고가치 선택 요구사항",
        "AI 이벤트 분류·권고 모델 포함",
        "표준 모니터링 / 관리자 / 리포팅",
        "실용적 WBS 및 인력 모델"
      ],
      risk: "보통",
      confidence: 0.78
    },
    L: {
      key: "L",
      name: "Large",
      tagline: "전략 제안 · 고품질 차별화",
      bestFor: "전략 계정 · 다년 사업 · 기술 가점 비중 높은 RFP",
      features: [
        "전체 범위 + XAI · 데이터 거버넌스",
        "고급 리포팅 / 대시보드",
        "보안 · 모니터링 · DevOps 강화",
        "QA · 이관 · 안정화 공수 확장"
      ],
      risk: "낮음",
      confidence: 0.74
    }
  };

  const stages = [
    { id: "s1", label: "파일 업로드", detail: "1개 파일 · 4.2 MB" },
    { id: "s2", label: "문서 형식 확인", detail: "HWPX 구조 검증 완료" },
    { id: "s3", label: "본문 추출", detail: "47페이지 텍스트 추출" },
    { id: "s4", label: "표·목차 분석", detail: "표 11개 · 목차 7단" },
    { id: "s5", label: "요구사항 정리", detail: "기능·비기능·보안 분류 중" },
    { id: "s6", label: "공수 산정 준비", detail: "KOSA · ISBSG 가정 매핑" }
  ];

  // Recent analyses
  const recents = [
    {
      id: "a1",
      title: "도시철도 통합관제 플랫폼 고도화 및 AI 운영지원 시스템 구축",
      agency: "한국교통공단",
      mm: 42.5,
      status: "report",
      package: "Medium",
      updatedAt: "오늘 14:22"
    },
    {
      id: "a2",
      title: "지자체 통합 행정 데이터 플랫폼 (3차) 유지관리",
      agency: "광역시 정보통신담당관",
      mm: 18.2,
      status: "review",
      package: "Small",
      updatedAt: "어제 17:08"
    },
    {
      id: "a3",
      title: "재난안전 통합 모니터링 AI 솔루션 제안",
      agency: "국립재난안전연구원",
      mm: 56.0,
      status: "shared",
      package: "Large",
      updatedAt: "5월 14일"
    },
    {
      id: "a4",
      title: "공공 의료기록 표준화 및 데이터 거버넌스 사업",
      agency: "보건복지부 산하 기관",
      mm: 0,
      status: "parsing",
      package: "-",
      updatedAt: "5월 12일"
    }
  ];

  const report = {
    summaryEN: `This RFP is well-suited for a Medium package bid strategy. The estimated effort is 42.5 MM, with a plausible range of 35.0–52.0 MM at 78% confidence. Procurement reverse estimation against the published budget of KRW 4.28B and a 14-month delivery window yields an implied unit cost in the KRW 11–13M / MM band, consistent with KOSA assumptions.`,
    scopeEN: `Functional scope centres on an integrated transit operations console with role-based access control and an AI event-classification module that recommends operator actions. Non-functional requirements emphasise CSAP-compliant public-cloud deployment, active-active redundancy, and quarterly security operations. Two ambiguous items — historical log ETL volume and unstructured log definition — are flagged as requiring buyer clarification before bid finalisation.`,
    estimateRows: [
      ["Functional development", "21.5 MM"],
      ["Infrastructure & deployment", "5.0 MM"],
      ["Data migration & ETL", "5.0 MM"],
      ["Security operations (annualised)", "2.0 MM"],
      ["Proposal differentiators", "7.0 MM"],
      ["PM / QA / Documentation", "2.0 MM"]
    ],
    risksEN: [
      "Volume and shape of historical operational data not specified — buyer Q&A advised.",
      "AI model evaluation criteria are not yet quantified; propose precision/recall targets explicitly.",
      "Budget headroom is moderate against extracted scope; downgrade to Small is feasible if optional items are excluded."
    ]
  };

  const emailDraft = {
    subject: "RFP Review — Integrated Transit Ops & AI Support Platform (Medium package, 42.5 MM)",
    to: "review-lead@example.org",
    body: `Hi team,

Below is the preliminary analysis of the integrated transit operations RFP issued by the Korea Transport Authority.

Recommended package: Medium
Estimated effort: 42.5 MM (range 35.0–52.0 MM, confidence 78%)
Budget adequacy: caution — implied unit cost is in the KRW 11–13M / MM band
Top risk: historical-log ETL scope is not specified; buyer Q&A recommended before bid finalisation

Differentiators included in the Medium package:
- AI event classification and operator-recommendation module
- Real-time operations KPI dashboard
- Automated incident response runbook

A full report and source-evidence trail is attached. Please review and flag any assumption you would like to adjust before we finalise the bid recommendation.

Thanks,
MOLI`
  };

  return { project, requirements, packages, stages, recents, report, emailDraft, evidence, ROLES };
})();
