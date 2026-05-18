# MOLI Harness-First Design

## Goal

하네스 fixture로 공공 RFP 분석 전체 흐름을 검증하고, 모바일 한국어 UI와 한국어 보고서를 제공하는 MVP를 만든다.

## Design

서비스는 무의존 Node 서버와 정적 브라우저 UI로 구성한다. 파서, 추출, 산정, 패키지, 보고서, 공유 기능은 `src/features/*`에 분리하고, HTTP API는 `src/server/server.mjs`에서 같은 계약으로 노출한다.

## Language Rule

사용자 중요 지시사항에 따라 웹 UI와 생성 보고서/메일 초안은 한국어로 제공한다. 원문 근거 quote는 fixture 언어를 보존한다.

## Harness

`harness/fixtures`와 `harness/expected`를 먼저 만들고 Node test runner로 RED/GREEN 흐름을 확인한다. 모든 명령은 `package.json` 스크립트로 고정한다.

## Test Coverage

단위 테스트는 파서, 추출, 산정, 패키지, 보고서, 공유를 검증한다. 계약 테스트는 근거 없는 요구사항을 실패시킨다. 통합 테스트는 API 전체 흐름을 검증하고, UI 테스트는 한국어 copy와 모바일 CSS 계약을 확인한다.
