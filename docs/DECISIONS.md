# Architecture Decisions

### ADR-0001: 무의존 Node MVP

Date: 2026-05-18

Status: Accepted

## Context

초기 저장소에는 package 설정과 lockfile이 없고 네트워크 접근이 제한되어 있습니다.

## Decision

외부 패키지 없이 Node 내장 HTTP, Node test runner, 정적 브라우저 UI로 구현했습니다.

## Consequences

설치 없이 검증할 수 있지만 실제 배포 수준의 라우팅, 번들링, CSS 처리, 접근성 자동 점검은 후속 단계에서 보강해야 합니다.

### ADR-0002: 생성 보고서 언어는 한국어

Date: 2026-05-18

Status: Accepted

## Context

원본 PRD/HARNESS에는 생성 보고서와 메일을 영어로 요구하는 문구가 있습니다. 사용자 중요 지시사항은 웹사이트와 결과 보고서를 한국어로 작성하라고 지정했습니다.

## Decision

사용자 중요 지시사항을 우선하여 UI, 보고서, 메일 초안을 한국어로 생성합니다.

## Consequences

하네스와 report schema는 `language: "ko"`를 요구합니다. 영어 보고서가 필요하면 별도 옵션으로 추가해야 합니다.

### ADR-0003: 실제 문서 파서는 어댑터 경계 뒤로 연기

Date: 2026-05-18

Status: Accepted

## Context

HWP/HWPX/DOCX/PDF 파서는 외부 라이브러리나 변환 도구가 필요할 수 있습니다.

## Decision

MVP는 Markdown/TXT fixture 파서로 전체 제품 흐름을 검증하고, 실제 포맷 파서는 같은 `parseFile` 계약 뒤에 추가합니다.

## Consequences

제품 흐름과 계약은 검증되지만 실제 파일 포맷 지원은 제한 사항으로 남습니다.

### ADR-0004: E2E 하네스는 Node runner로 실행

Date: 2026-05-18

Status: Accepted

## Context

요청 구조에는 `playwright.config.ts`가 포함되지만 현재 환경은 외부 패키지 설치와 로컬 소켓 바인딩이 제한됩니다.

## Decision

`playwright.config.ts`는 향후 Playwright 전환을 위한 설정 파일로 두고, 현재 `npm run test:e2e`는 Node 내장 test runner와 서버의 in-process fetch fallback으로 핵심 흐름을 검증합니다.

## Consequences

브라우저 엔진 수준의 시각 회귀 검증은 후속 작업입니다. 현재 하네스는 HTML/CSS/API 계약과 모바일 copy/accessibility 조건을 결정적으로 검증합니다.
