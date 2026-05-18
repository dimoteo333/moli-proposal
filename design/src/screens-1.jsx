// MOLI Public Proposal Agent — primary screens (Home, New Analysis, Upload, Parsing Review, Summary)

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA } = React;

// ----- Logo Mark -----
function LogoMark({ size = "md" }) {
  return (
    <div className={"logo-mark" + (size === "sm" ? " sm" : "")}>
      <span>몰리</span>
    </div>
  );
}

// ===== 1. Home / Analysis List =====
function HomeScreen({ nav, hasRecents = true }) {
  const data = window.MOLI_DATA;
  return (
    <Page title="" transparentBar>
      <div className="page-padding" style={{ paddingTop: 8 }}>
        <div className="row between" style={{ marginBottom: 24 }}>
          <div className="row gap-12">
            <LogoMark/>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>MOLI</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-navy)", letterSpacing: "-0.01em" }}>공공제안 에이전트</div>
            </div>
          </div>
          <button className="icon-btn" aria-label="설정" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, color: "var(--color-text-muted)" }}>
            <Icon name="menu" size={22}/>
          </button>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #0046ff 0%, #2a6bff 100%)",
          color: "#fff",
          borderRadius: 24,
          padding: 20,
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 12px 32px rgba(0, 70, 255, 0.22)"
        }}>
          <div style={{
            position: "absolute", right: -40, top: -40, width: 180, height: 180,
            background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 60%)"
          }}/>
          <div style={{ fontSize: 13, opacity: 0.88, fontWeight: 500, letterSpacing: "-0.01em" }} className="ko">
            공공 RFP를 업로드하면,
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 4, lineHeight: 1.3 }} className="ko">
            공수·제안 아이템·WBS를<br/>
            <span style={{ background: "rgba(255,255,255,0.18)", padding: "0 8px", borderRadius: 8 }}>근거</span>와 함께 산출합니다.
          </div>
          <button className="btn" onClick={() => nav("new")}
            style={{ marginTop: 18, background: "#fff", color: "var(--color-primary)", height: 48, padding: "0 18px", borderRadius: 14, fontSize: 15, fontWeight: 700 }}>
            <Icon name="plus" size={18}/>
            새 분석 시작
          </button>
        </div>

        <div className="row between" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-navy)", letterSpacing: "-0.01em" }}>최근 분석</div>
          <button className="btn ghost" style={{ height: 32, padding: "0 4px" }}>전체 보기
            <Icon name="chevron-right" size={16}/>
          </button>
        </div>

        {hasRecents ? (
          data.recents.map(r => (
            <button key={r.id} className="analysis-row" onClick={() => nav("summary")} style={{ width: "100%", textAlign: "left" }}>
              <div className="top">
                <div className="title ko">{r.title}</div>
                <StatusBadge status={r.status}/>
              </div>
              <div className="meta">
                <span>{r.agency}</span>
                <span>·</span>
                <span>{r.updatedAt}</span>
              </div>
              <div className="footer">
                <div>
                  {r.mm > 0 ? (
                    <span><span className="mm">{r.mm.toFixed(1)} MM</span> · {r.package}</span>
                  ) : (
                    <span style={{ color: "var(--color-info)" }}>파싱 중 · 3 / 6 단계</span>
                  )}
                </div>
                <Icon name="chevron-right" size={16} color="var(--color-text-subtle)"/>
              </div>
            </button>
          ))
        ) : (
          <div className="empty-state">
            <div className="glyph">
              <Icon name="doc" size={32} color="var(--color-ai)"/>
            </div>
            <div className="title">아직 분석한 공고가 없습니다.</div>
            <div className="body ko">공고문 URL과 RFP 문서를 업로드해<br/>제안 검토를 시작하세요.</div>
            <button className="btn primary" onClick={() => nav("new")} style={{ marginTop: 8 }}>
              <Icon name="plus" size={18} color="#fff"/>
              새 분석 시작
            </button>
          </div>
        )}
        <div className="section-spacer"/>
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
            <LogoMark size="sm"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-navy)" }}>RFP 문서를 분석하고 있습니다</div>
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
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "var(--color-ai)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <Icon name="sparkle" size={18} color="#fff"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-ai)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>AI 검토 의견</div>
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
  HomeScreen, NewAnalysisScreen, UploadProgressScreen, ParsingReviewScreen, SummaryScreen, LogoMark
});
