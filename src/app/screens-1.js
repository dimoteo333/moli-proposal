// MOLI Public Proposal Agent — primary screens (Home, New Analysis, Upload, Parsing Review, Summary)

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

// ----- Logo Mark (real brand asset: assets/logo.png) -----
function LogoMark({ size = "md" }) {
  return (
    <div className={"logo-mark" + (size === "sm" ? " sm" : "")}>
      <img src="/assets/logo.png" alt="몰리 로고"/>
    </div>
  );
}

// ----- Moli character avatar (assets/moli-icon-4.png) -----
function MoliAvatar({ size = 44 }) {
  return (
    <div className="moli-avatar" style={{ width: size, height: size }}>
      <img src="/assets/moli-icon-4.png" alt="몰리 캐릭터"/>
    </div>
  );
}

// ===== 1. Home / Landing — soft AI SaaS aesthetic =====
function HomeScreen({ nav, hasRecents = true }) {
  const data = window.MOLI_DATA;

  // Cycle a small AI status line in the preview card for some life
  const [typed, setTyped] = useStateA("이벤트 분류 모델 · AI 차별화 후보로 추천");
  useEffectA(() => {
    const lines = [
      "이벤트 분류 모델 · AI 차별화 후보로 추천",
      "데이터 이관 범위 · 발주처 질의 필요",
      "Medium 패키지 기준 공수 42.5 MM 산정 완료"
    ];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % lines.length;
      setTyped(lines[i]);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const recents = data.recents.slice(0, 3);
  const recentIcons = [
    { c: "b", label: "교통" },
    { c: "p", label: "행정" },
    { c: "g", label: "재난" },
    { c: "o", label: "의료" }
  ];

  return (
    <Page transparentBar>
      <div className="home">
        <div className="aurora a1"/>
        <div className="aurora a2"/>
        <div className="aurora a3"/>

        {/* Top nav */}
        <nav className="home-nav">
          <div className="brand-mark">
            <LogoMark size="sm"/>
            <div className="name">
              몰리<span className="accent">.</span>
              <span style={{ fontWeight: 500, color: "var(--color-text-muted)", fontSize: 13, marginLeft: 4 }}>공공제안</span>
            </div>
          </div>
          <div className="nav-actions">
            {data.demo.live && (
              <span className="live-pill" aria-label="라이브 데모 진행 중">
                <span className="live-dot"/>
                LIVE 데모
              </span>
            )}
            <button className="nav-icon" aria-label="메뉴">
              <Icon name="menu" size={18}/>
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <div className="hero-eyebrow">
            <span className="ico-wrap">
              <Icon name="sparkle" size={11} color="#fff" stroke={2.2}/>
            </span>
            <span>{data.demo.eyebrow}</span>
            <span className="new-dot"/>
          </div>

          <h1 className="hero-headline ko">
            공공 RFP를 읽고,<br/>
            <span className="grad">근거와 공수</span>까지<br/>
            한 번에 정리합니다.
          </h1>
          <p className="hero-sub ko">
            HWP·PDF로 받은 입찰 RFP를 업로드하면, 요구사항을 분류하고
            공수·인프라·제안 아이템을 원문 인용과 함께 산출하는 모바일 워크벤치입니다.
          </p>

          <div className="hero-cta-row">
            <button className="btn primary" onClick={() => nav("new")}>
              <Icon name="sparkle" size={16} color="#fff" stroke={2}/>
              지금 RFP 분석 시작하기
              <Icon name="chevron-right" size={16} color="#fff"/>
            </button>
            <button className="btn secondary" onClick={() => nav("summary")}>
              <Icon name="eye" size={14}/>
              샘플 분석 살펴보기
            </button>
          </div>

          <div className="hero-trust">
            <div className="avatars">
              <div className="av" style={{ background: "linear-gradient(135deg, #0046ff, #4b86ff)" }}>JS</div>
              <div className="av" style={{ background: "linear-gradient(135deg, #7a5af8, #b095ff)" }}>MK</div>
              <div className="av" style={{ background: "linear-gradient(135deg, #16b364, #4cca8b)" }}>YH</div>
              <div className="av" style={{ background: "linear-gradient(135deg, #dc6803, #f6a259)" }}>+</div>
            </div>
            <span>신한은행 제안팀 · PMO · SI 아키텍트가 함께 쓰는 워크벤치</span>
          </div>

          {/* Moli waters the analysis below — reserves its own space so it never covers content */}
          <div className="hero-moli-wrap" aria-hidden="true">
            <img className="hero-moli" src="/assets/moli-character.png" alt=""/>
          </div>

          {/* Floating preview card */}
          <div className="hero-preview">
            <div className="preview-head">
              <div className="dots">
                <span style={{ background: "#f1554b" }}/>
                <span style={{ background: "#f5be3c" }}/>
                <span style={{ background: "#4ec264" }}/>
              </div>
              <div className="filename">
                <Icon name="file" size={11} color="var(--color-text-muted)"/>
                도시철도 통합관제 RFP · 분석중
              </div>
              <div style={{ marginLeft: "auto" }}>
                <Badge tone="ai" dot>AI</Badge>
              </div>
            </div>

            <div className="ai-line">
              <span className="ai-ico">
                <Icon name="sparkle" size={10} color="#fff" stroke={2.4}/>
              </span>
              <span className="ko typing" style={{ flex: 1 }}>{typed}</span>
            </div>

            <div className="mm-row">
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--color-text-subtle)", letterSpacing: "0.06em", textTransform: "uppercase" }}>예상 공수</span>
              <span className="num">42.5</span>
              <span className="unit">MM</span>
              <span className="delta">+2.0</span>
            </div>

            <div className="req-mini">
              <span className="mini-cb">
                <Icon name="check" size={10} color="#fff" stroke={3.5}/>
              </span>
              <span className="ko">통합 관제 대시보드 및 권한 관리</span>
              <Badge tone="primary">추천</Badge>
              <span className="mini-mm">4.5 MM</span>
            </div>
            <div className="req-mini">
              <span className="mini-cb">
                <Icon name="check" size={10} color="#fff" stroke={3.5}/>
              </span>
              <span className="ko">AI 이벤트 분류 모델</span>
              <Badge tone="ai">강력 추천</Badge>
              <span className="mini-mm">10.0 MM</span>
            </div>
            <div className="req-mini unchecked">
              <span className="mini-cb"></span>
              <span className="ko" style={{ color: "var(--color-text-muted)" }}>XAI 설명 가능성 모듈</span>
              <Badge tone="neutral">선택</Badge>
              <span className="mini-mm" style={{ color: "var(--color-text-muted)" }}>3.0 MM</span>
            </div>
          </div>
        </section>

        {/* Stats — values live in MOLI_DATA.demo.stats so they can be edited during the live demo */}
        <div className="stats-strip">
          {data.demo.stats.map((s, i) => (
            <div className="item" key={i}>
              <div className="num">
                {s.value}
                {s.unit && <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginLeft: 2 }}>{s.unit}</span>}
              </div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Live demo banner — the AI coding agent narrates its edits here */}
        {data.demo.live && (
          <div className="demo-banner">
            <MoliAvatar size={40}/>
            <div style={{ flex: 1 }}>
              <div className="demo-title">
                <Icon name="sparkle" size={13} color="var(--color-primary)" stroke={2.2}/>
                {data.demo.bannerTitle}
              </div>
              <div className="demo-body ko">{data.demo.bannerBody}</div>
            </div>
          </div>
        )}

        {/* Features */}
        <section className="land-section">
          <div className="land-eyebrow">왜 몰리인가</div>
          <h2 className="land-title ko">
            챗봇이 아닌, <span style={{ background: "linear-gradient(135deg, #6b4eff, #0046ff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>근거 기반 워크벤치</span>
          </h2>
          <p className="land-sub ko">
            모든 산정에는 원문 인용·신뢰도·가정이 함께 따라옵니다. AI가 만든 추정도 사람이 검토하고 조정할 수 있어야 합니다.
          </p>

          <div className="feature-grid">
            <div className="feature-card blue">
              <div className="fglow"/>
              <div className="fico"><Icon name="file" size={20} color="#fff" stroke={2}/></div>
              <div className="ftitle ko">RFP를 구조화해서 읽기</div>
              <div className="fbody ko">HWP·HWPX·PDF를 파싱해 사업개요, 기능·비기능·보안 요구사항으로 자동 분류합니다.</div>
            </div>
            <div className="feature-card purple">
              <div className="fglow"/>
              <div className="fico"><Icon name="sparkle" size={20} color="#fff" stroke={2}/></div>
              <div className="ftitle ko">근거가 따라붙는 AI 산정</div>
              <div className="fbody ko">KOSA·ISBSG·예산 역산을 결합해 MM 범위와 신뢰도를 제시하고, 모든 항목에 원문 인용이 연결됩니다.</div>
            </div>
            <div className="feature-card green">
              <div className="fglow"/>
              <div className="fico"><Icon name="share" size={18} color="#fff" stroke={2}/></div>
              <div className="ftitle ko">검토자와 안전하게 공유</div>
              <div className="fbody ko">보기 전용·재산정 가능·내부 검토자 권한을 선택해 공유하고, 원본은 항상 안전하게 보존합니다.</div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="land-section">
          <div className="land-eyebrow">3단계 흐름</div>
          <h2 className="land-title ko">업로드부터 제출용 레포트까지</h2>
          <p className="land-sub ko">
            RFP 파일과 공고 URL만 있으면 충분합니다. 나머지는 몰리가 가져갑니다.
          </p>

          <div className="step-list">
            <div className="step-item">
              <div className="step-num">01</div>
              <div className="step-body">
                <div className="step-title">RFP 업로드 + 공고 URL</div>
                <div className="step-desc ko">HWP·HWPX·DOCX·PDF·ZIP 지원. 나라장터 메타데이터가 있으면 자동으로 가져옵니다.</div>
              </div>
            </div>
            <div className="step-item">
              <div className="step-num">02</div>
              <div className="step-body">
                <div className="step-title">체크리스트로 즉시 재산정</div>
                <div className="step-desc ko">요구사항을 포함/제외하면 총 공수와 패키지가 실시간으로 갱신됩니다. 근거는 한 번 탭으로 확인할 수 있습니다.</div>
              </div>
            </div>
            <div className="step-item">
              <div className="step-num">03</div>
              <div className="step-body">
                <div className="step-title">한글 레포트와 메일 초안</div>
                <div className="step-desc ko">WBS·리스크·메일 초안까지 한글로 자동 생성. 그대로 복사하거나 PDF로 내보낼 수 있습니다.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent work */}
        {hasRecents && (
          <section className="recent-section">
            <div className="row between" style={{ marginBottom: 12 }}>
              <div>
                <div className="land-eyebrow" style={{ marginBottom: 4 }}>이어보기</div>
                <h2 className="land-title ko" style={{ fontSize: 18 }}>최근 분석</h2>
              </div>
              <button className="btn ghost" style={{ height: 32, padding: "0 4px" }}>전체
                <Icon name="chevron-right" size={16}/>
              </button>
            </div>
            {recents.map((r, i) => {
              const ic = recentIcons[i % recentIcons.length];
              return (
                <button key={r.id} className="recent-card" onClick={() => nav("summary")}>
                  <div className={"rico " + ic.c}>{ic.label}</div>
                  <div className="rmeta">
                    <div className="rtitle ko">{r.title}</div>
                    <div className="rsub">
                      <span>{r.agency}</span>
                      <span>·</span>
                      <span>{r.updatedAt}</span>
                    </div>
                  </div>
                  {r.mm > 0 ? (
                    <div className="rmm">{r.mm.toFixed(1)}<span style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-muted)", marginLeft: 2 }}>MM</span></div>
                  ) : (
                    <StatusBadge status={r.status}/>
                  )}
                </button>
              );
            })}
          </section>
        )}

        {!hasRecents && (
          <section className="recent-section">
            <div className="empty-state" style={{ padding: "20px 24px" }}>
              <div className="glyph moli"><img src="/assets/moli-icon-4.png" alt="새싹 화분을 든 몰리"/></div>
              <div className="title">첫 분석을 시작해 보세요</div>
              <div className="body ko">RFP 파일과 공고 URL을 함께 입력하면 추출 정확도가 더 높아집니다.</div>
            </div>
          </section>
        )}

        {/* Closing CTA */}
        <div className="closing-cta">
          <div className="cta-title ko">
            오늘 받은 RFP, <br/>
            <span style={{
              background: "linear-gradient(135deg, #6b8aff 0%, #b095ff 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent"
            }}>몇 분이면 검토를 끝낼 수 있어요.</span>
          </div>
          <div className="cta-sub ko">평균 90초 내 1차 분석. 모든 산정은 원문 근거로 추적됩니다.</div>
          <button className="btn block" onClick={() => nav("new")} style={{ width: "100%" }}>
            <Icon name="sparkle" size={16} color="var(--color-navy)" stroke={2}/>
            새 분석 시작
            <Icon name="chevron-right" size={16}/>
          </button>
        </div>

        <footer className="home-footer">
          <div className="lock-row">
            <Icon name="shield" size={12} color="var(--color-text-muted)"/>
            업로드 파일은 암호화 저장 · AI 학습 미사용
          </div>
          <div className="co-brand" style={{ marginBottom: 6 }}>
            <img src="/assets/shinhan-ci.png" alt="신한은행 CI"/>
            신한은행 × 몰리
          </div>
          <div>© 2026 Shinhan Bank · MOLI Public Proposal Agent v1.0</div>
        </footer>
      </div>
    </Page>
  );
}

// ===== 2. New Analysis =====
function NewAnalysisScreen({ nav }) {
  const [url, setUrl] = useStateA("https://www.g2b.go.kr/...notice-id=20260513-A0042");
  const [files, setFiles] = useStateA([
    { name: "제안요청서_도시철도통합관제_2026.hwpx", size: "4.2 MB", type: "HWPX" }
  ]);
  const [mode, setMode] = useStateA("standard");
  const canStart = files.length > 0;

  return (
    <Page title="새 분석" onBack={() => nav("home")} hasBottomBar
      bottomBar={
        <BottomBar>
          <button className="btn primary block" disabled={!canStart} onClick={() => nav("upload")}>
            분석 시작
          </button>
        </BottomBar>
      }>
      <div className="page-padding">
        <div className="card">
          <div className="card-section">
            <div className="input-group">
              <label className="label">공고문 URL</label>
              <div className="helper">나라장터 또는 공공기관 입찰공고 URL을 입력하세요.</div>
              <div style={{ position: "relative" }}>
                <input className="input" value={url} onChange={e => setUrl(e.target.value)} style={{ paddingLeft: 40 }}/>
                <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-subtle)" }}>
                  <Icon name="link" size={18}/>
                </div>
              </div>
              <div className="row gap-8" style={{ fontSize: 12, color: "var(--color-success)", marginTop: 2 }}>
                <Icon name="check" size={14} color="var(--color-success)" stroke={2.5}/>
                나라장터 메타데이터 추출 가능
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-section">
            <div className="input-group">
              <label className="label">RFP 문서 업로드</label>
              <div className="helper">HWP, HWPX, DOCX, PDF 파일을 업로드할 수 있습니다.</div>
            </div>

            <div className="dropzone">
              <div className="icon"><Icon name="upload" size={22}/></div>
              <div style={{ fontSize: 14, color: "var(--color-text)", fontWeight: 500 }}>탭하여 파일 선택</div>
              <div style={{ fontSize: 12 }}>또는 파일을 여기로 드래그하세요</div>
            </div>

            {files.length > 0 && (
              <div>
                {files.map((f, i) => (
                  <div key={i} className="file-row">
                    <div className="ico">{f.type}</div>
                    <div className="meta">
                      <div className="name">{f.name}</div>
                      <div className="sub">{f.size} · 형식 확인 완료</div>
                    </div>
                    <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-subtle)", borderRadius: 8 }}>
                      <Icon name="close" size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-section">
            <div className="input-group">
              <label className="label">분석 방식</label>
              <div className="helper">상세 산정은 시간이 더 걸리지만 정확도가 높습니다.</div>
            </div>
            <div className="col gap-8">
              {[
                { key: "quick", title: "빠른 검토", sub: "핵심 요구사항·예상 공수 범위만 빠르게", time: "약 30초" },
                { key: "standard", title: "표준 분석", sub: "전체 요구사항 분류 + 근거 매핑 + 패키지 비교", time: "약 1–2분", recommended: true },
                { key: "detailed", title: "상세 산정", sub: "FP 후보 추정 + 역할별 분배 + 리스크 분석", time: "약 3–5분" }
              ].map(opt => (
                <button key={opt.key}
                  className={"permission-row" + (mode === opt.key ? " selected" : "")}
                  onClick={() => setMode(opt.key)} style={{ marginTop: 0 }}>
                  <div className="radio"/>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div className="row between">
                      <div className="name">
                        {opt.title}
                        {opt.recommended && <span style={{ marginLeft: 8 }}><Badge tone="primary">권장</Badge></span>}
                      </div>
                      <div className="tag"><Icon name="clock" size={12}/>{opt.time}</div>
                    </div>
                    <div className="desc ko">{opt.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 14, background: "#fff", border: "1px solid var(--color-border)", borderRadius: 14 }}>
          <div className="row gap-8" style={{ alignItems: "flex-start" }}>
            <div style={{ color: "var(--color-info)", marginTop: 2 }}>
              <Icon name="shield" size={18}/>
            </div>
            <div className="ko" style={{ fontSize: 12.5, color: "var(--color-text-muted)", lineHeight: 1.55 }}>
              업로드된 RFP 문서는 암호화되어 저장되며, AI 학습에는 사용되지 않습니다.
              공유 시 원본 파일은 노출되지 않고 추출된 결과만 공유됩니다.
            </div>
          </div>
        </div>
        <div className="section-spacer"/>
      </div>
    </Page>
  );
}

// ===== 3. Upload Progress =====
function UploadProgressScreen({ nav }) {
  const stages = window.MOLI_DATA.stages;
  const [step, setStep] = useStateA(0);

  useEffectA(() => {
    if (step < stages.length) {
      const t = setTimeout(() => setStep(step + 1), step === 0 ? 900 : step === 4 ? 1400 : 1100);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => nav("parsing"), 700);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <Page title="문서 분석 중">
      <div className="page-padding">
        <div className="card">
          <div className="row gap-12" style={{ marginBottom: 14, alignItems: "center" }}>
            <MoliAvatar/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-navy)" }}>몰리가 RFP 문서를 읽고 있어요</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>표와 요구사항 구조를 함께 분석합니다.</div>
            </div>
          </div>
          <div className="progress">
            <span style={{ width: `${Math.min(100, (step / stages.length) * 100)}%` }}/>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--color-text-muted)", display: "flex", justifyContent: "space-between" }}>
            <span>단계 {Math.min(step + 1, stages.length)} / {stages.length}</span>
            <span>예상 1–2분</span>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="timeline">
            {stages.map((s, i) => (
              <div key={s.id} className={"timeline-item " + (i < step ? "done" : i === step ? "active" : "")}>
                <div className="marker">
                  {i < step ? <Icon name="check" size={14} color="#fff" stroke={3}/> :
                   i === step ? <Icon name="sparkle" size={12} color="var(--color-primary)" stroke={2}/> :
                   <span style={{ fontSize: 11, fontWeight: 600 }}>{i + 1}</span>}
                </div>
                <div className="label">{s.label}</div>
                <div className="detail">{s.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, padding: 12, background: "var(--color-info-soft)", borderRadius: 12, fontSize: 12.5, color: "var(--color-navy)", lineHeight: 1.5 }} className="ko">
          <strong style={{ color: "var(--color-info)" }}>안내</strong> · 분석은 백그라운드에서도 계속됩니다.
          다른 화면으로 이동해도 완료 시 알림으로 안내드립니다.
        </div>
      </div>
    </Page>
  );
}

// ===== 4. Parsing Result Review =====
function ParsingReviewScreen({ nav }) {
  const data = window.MOLI_DATA;
  const p = data.project;
  const fields = [
    { k: "사업명", v: p.title, conf: 0.94 },
    { k: "발주기관", v: p.agency, conf: 0.96 },
    { k: "사업예산", v: "4,280,000,000 원", conf: 0.92 },
    { k: "계약기간", v: p.contractPeriodMonths + " 개월", conf: 0.95 },
    { k: "제안 마감일", v: "2026년 6월 12일 18:00", conf: 0.88 },
    { k: "입찰 방식", v: p.bidMethod, conf: 0.94 },
  ];
  const need = [
    { k: "운영 인력 상주 요건", note: "원문에 언급되었으나 시간·인원 수치 미명시" },
    { k: "데이터 이관 대상 규모", note: "약 4년치 이력 외 정확 건수 없음" }
  ];

  return (
    <Page title="파싱 결과 확인" onBack={() => nav("upload")} hasBottomBar
      bottomBar={<BottomBar><button className="btn primary block" onClick={() => nav("summary")}>분석 결과 보기</button></BottomBar>}>
      <div className="page-padding">
        <div className="row gap-8" style={{ marginBottom: 14 }}>
          <Badge tone="success" dot>분석 완료</Badge>
          <Badge tone="info">47p · 표 11개</Badge>
        </div>

        <div className="card">
          <div className="card-section">
            <div className="card-title">사업 개요</div>
            <div className="col gap-12">
              {fields.map((f, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", fontWeight: 500, paddingTop: 2 }}>{f.k}</div>
                  <div>
                    <div className="ko" style={{ fontSize: 14.5, color: "var(--color-navy)", fontWeight: 500, lineHeight: 1.45 }}>{f.v}</div>
                    <div className="tag" style={{ marginTop: 3 }}>
                      <Icon name="check" size={12} color="var(--color-success)" stroke={2.5}/>
                      추출 신뢰도 {Math.round(f.conf * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn secondary" style={{ marginTop: 4, width: "100%" }}>
              <Icon name="edit" size={16}/>
              항목 수정
            </button>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12, borderColor: "#f7d3b6", background: "var(--color-warning-soft)" }}>
          <div className="card-section">
            <div className="row gap-8">
              <Icon name="warn" size={18} color="var(--color-warning)"/>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-warning)" }}>확인 필요 항목 ({need.length})</div>
            </div>
            <div className="col gap-12">
              {need.map((n, i) => (
                <div key={i}>
                  <div className="ko" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-navy)" }}>{n.k}</div>
                  <div className="ko" style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2, lineHeight: 1.5 }}>{n.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-section">
            <div className="card-title">추출 통계</div>
            <div className="tiles">
              <div className="tile">
                <div className="lbl">요구사항</div>
                <div className="val">28</div>
                <div className="sub">기능 14 · 비기능 8 · 보안 6</div>
              </div>
              <div className="tile">
                <div className="lbl">근거 매핑률</div>
                <div className="val">96%</div>
                <div className="sub">2건은 검토 필요</div>
              </div>
            </div>
          </div>
        </div>
        <div className="section-spacer"/>
      </div>
    </Page>
  );
}

// ===== 5. Analysis Summary Dashboard =====
function SummaryScreen({ nav }) {
  const data = window.MOLI_DATA;
  return (
    <Page title="분석 결과" onBack={() => nav("home")} hasBottomBar
      right={<button className="icon-btn" aria-label="공유"><Icon name="share" size={20}/></button>}
      bottomBar={<BottomBar><button className="btn primary block" onClick={() => nav("checklist")}>
        체크리스트로 이동
        <Icon name="chevron-right" size={18} color="#fff"/>
      </button></BottomBar>}>
      <div className="page-padding">
        <div className="ko" style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500, marginBottom: 4 }}>{data.project.agency}</div>
        <div className="ko" style={{ fontSize: 20, fontWeight: 700, color: "var(--color-navy)", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 12 }}>{data.project.title}</div>
        <div className="row gap-8" style={{ flexWrap: "wrap", marginBottom: 16 }}>
          <Badge tone="primary">{data.project.businessDomain}</Badge>
          <Badge tone="neutral">{data.project.contractPeriodMonths} 개월</Badge>
          <Badge tone="neutral">4.28B KRW</Badge>
        </div>

        {/* Main MM summary card */}
        <div className="card" style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f4f7ff 100%)",
          borderColor: "#dde6ff"
        }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <div className="card-title">예상 공수</div>
            <Badge tone="ai" dot>AI 산정</Badge>
          </div>
          <div className="row" style={{ alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-navy)", fontVariantNumeric: "tabular-nums" }}>42.5</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-muted)" }}>MM</div>
            <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>범위 35.0–52.0</div>
          </div>
          <MMRange min={35} recommended={42.5} max={52}/>
          <div className="row gap-12" style={{ marginTop: 8, fontSize: 12.5, color: "var(--color-text-muted)" }}>
            <div className="row gap-8">
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--color-success)" }}/>
              신뢰도 78%
            </div>
            <div className="row gap-8">
              <div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--color-warning)" }}/>
              리스크 보통
            </div>
          </div>
        </div>

        <div className="tiles" style={{ marginTop: 12 }}>
          <div className="tile">
            <div className="lbl">예산 적정성</div>
            <div className="val" style={{ color: "var(--color-warning)" }}>주의</div>
            <div className="sub ko">현재 범위 대비 공수 여유 낮음</div>
          </div>
          <div className="tile">
            <div className="lbl">리스크 점수</div>
            <div className="val">38<span style={{ fontSize: 14, color: "var(--color-text-muted)", fontWeight: 500 }}>/100</span></div>
            <div className="sub ko">데이터 이관 범위 불명확</div>
          </div>
          <div className="tile">
            <div className="lbl">요구사항</div>
            <div className="val">28</div>
            <div className="sub">필수 22 · 선택 6</div>
          </div>
          <div className="tile">
            <div className="lbl">인프라 추정</div>
            <div className="val">3.2 MM</div>
            <div className="sub">CSAP · Active-Active</div>
          </div>
        </div>

        {/* AI recommendation */}
        <div className="card" style={{ marginTop: 12, background: "var(--color-ai-soft)", borderColor: "#dcd9ff" }}>
          <div className="row gap-12" style={{ alignItems: "flex-start" }}>
            <MoliAvatar size={36}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-ai)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>몰리의 검토 의견</div>
              <div className="ko" style={{ fontSize: 14, color: "var(--color-navy)", lineHeight: 1.55 }}>
                <strong>Medium 패키지 기준 제안 검토를 권장</strong>합니다. AI 이벤트 분류 모델을 차별화 항목으로 강조하되,
                이력 데이터 이관 규모는 제안 전 발주처 질의를 권장합니다.
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="card-title">근거 분포</div>
            <button className="btn ghost" style={{ height: 28, padding: 0, fontSize: 12 }}>전체 보기</button>
          </div>
          <div className="col gap-8">
            {[
              { k: "원문 인용 매핑", v: "26 / 28", pct: 93, tone: "success" },
              { k: "공고 메타데이터", v: "5 항목", pct: 100, tone: "success" },
              { k: "검토 필요 항목", v: "2 항목", pct: 7, tone: "warning" }
            ].map((r, i) => (
              <div key={i}>
                <div className="row between" style={{ fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: "var(--color-text)" }}>{r.k}</span>
                  <span style={{ fontWeight: 600, color: "var(--color-navy)", fontVariantNumeric: "tabular-nums" }}>{r.v}</span>
                </div>
                <div className={"progress " + r.tone}>
                  <span style={{ width: r.pct + "%" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="section-spacer"/>
      </div>
    </Page>
  );
}

Object.assign(window, {
  HomeScreen, NewAnalysisScreen, UploadProgressScreen, ParsingReviewScreen, SummaryScreen, LogoMark, MoliAvatar
});
