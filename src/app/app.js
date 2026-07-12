// MOLI app shell + router

const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  // Read screen from URL hash so the user can deep-link in dev
  const initial = (location.hash || "#home").slice(1) || "home";
  const [screen, setScreen] = useStateApp(initial);
  const toasts = useToasts();

  useEffectApp(() => {
    location.hash = "#" + screen;
  }, [screen]);

  useEffectApp(() => {
    const onHash = () => {
      const next = (location.hash || "#home").slice(1) || "home";
      setScreen(next);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const nav = (s) => setScreen(s);

  let body = null;
  switch (screen) {
    case "home": body = <HomeScreen nav={nav}/>; break;
    case "home-empty": body = <HomeScreen nav={nav} hasRecents={false}/>; break;
    case "new": body = <NewAnalysisScreen nav={nav}/>; break;
    case "upload": body = <UploadProgressScreen nav={nav}/>; break;
    case "parsing": body = <ParsingReviewScreen nav={nav}/>; break;
    case "summary": body = <SummaryScreen nav={nav}/>; break;
    case "checklist": body = <ChecklistScreen nav={nav} toast={toasts.push}/>; break;
    case "packages": body = <PackagesScreen nav={nav}/>; break;
    case "report": body = <ReportScreen nav={nav} toast={toasts.push}/>; break;
    case "email": body = <EmailScreen nav={nav} toast={toasts.push}/>; break;
    case "share": body = <ShareScreen nav={nav} toast={toasts.push}/>; break;
    default: body = <HomeScreen nav={nav}/>;
  }

  return (
    <div className="app-shell">
      <aside className="desktop-context">
        <div className="row gap-12" style={{ alignItems: "center" }}>
          <div className="logo-mark">
            <img src="/assets/logo.png" alt="몰리 로고"/>
          </div>
          <div>
            <div className="ko-name">몰리 공공제안 에이전트</div>
            <div style={{ fontSize: 11, color: "var(--color-text-subtle)", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2, fontWeight: 600 }}>v1.0 · Live demo build</div>
          </div>
        </div>
        <h1 className="ko">공공 RFP를 근거와 함께<br/>제안 워크벤치로.</h1>
        <p className="lede ko">
          HWP·PDF로 받은 공공 입찰 RFP를 업로드하면,
          요구사항을 분류하고 공수·인프라·제안 아이템을 근거와 함께 산출하는 모바일 워크벤치입니다.
          이 프로토타입은 AI 코딩 에이전트가 시연 중 실시간으로 수정합니다.
        </p>
        <div className="features">
          <div className="feature">
            <div className="num">01</div>
            <div>
              <div className="label">근거 기반 산정</div>
              <div className="detail ko">모든 추정은 KOSA·ISBSG·발주 예산 역산 등 다층 레이어에 원문 인용으로 연결됩니다.</div>
            </div>
          </div>
          <div className="feature">
            <div className="num">02</div>
            <div>
              <div className="label">Small · Medium · Large 패키지</div>
              <div className="detail ko">한 번의 분석으로 세 가지 입찰 전략을 비교하고, 항목 토글로 즉시 재산정됩니다.</div>
            </div>
          </div>
          <div className="feature">
            <div className="num">03</div>
            <div>
              <div className="label">검토자 공유 워크플로</div>
              <div className="detail ko">보기 전용·재산정 가능·내부 검토자 권한으로 안전하게 공유합니다.</div>
            </div>
          </div>
          <div className="feature">
            <div className="num">04</div>
            <div>
              <div className="label">라이브 편집 데모</div>
              <div className="detail ko">시연 중 요청하신 문구·수치·기능 변경을 AI 코딩 에이전트가 그 자리에서 반영하고, 새로고침 한 번으로 확인합니다.</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 28, fontSize: 12, color: "var(--color-text-subtle)" }} className="ko">
          UI와 생성되는 레포트·메일 초안 모두 한글로 제공됩니다.
        </div>
        <div className="co-brand" style={{ marginTop: 16 }}>
          <img src="/assets/shinhan-ci.png" alt="신한은행 CI"/>
          신한은행 × 몰리 공공제안 에이전트
        </div>
      </aside>

      <main className="phone-frame">
        {body}
        <Toast messages={toasts.messages}/>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
