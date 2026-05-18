# Analysis Feature Boundary

분석 orchestration이 커지면 이 디렉터리로 이동합니다. 현재 MVP의 end-to-end 분석 흐름은 API 레이어 `src/server/server.mjs`에서 파서, 추출, 산정, 패키지, 보고서, 공유 모듈을 순서대로 호출합니다.
