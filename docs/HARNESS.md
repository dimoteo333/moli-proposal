# Harness Guide

## 목적

이 문서는 몰리 공공제안 에이전트가 어떻게 검증되는지 정의합니다. 제품은 UI 목업이 아니라 파서, 추출, 산정, 패키지, 보고서, 공유 재산정 흐름을 반복 실행할 수 있는 하네스 기반 서비스로 구현됩니다.

## 원칙

1. 모든 AI 보조 출력은 스키마를 갖습니다.
2. 모든 스키마는 fixture와 기대 결과를 갖습니다.
3. 모든 산정값은 가정, 근거, 신뢰도, 리스크를 노출합니다.
4. 보고서의 주요 주장은 근거 또는 산정 가정에 연결됩니다.
5. 사용자 수정은 원래 AI 산정값과 수정 사유를 보존합니다.
6. 공유 재산정은 원본을 바꾸지 않고 파생 버전을 만듭니다.
7. 웹 UI와 생성 보고서는 한국어로 제공합니다.

## 하네스 범주

### Parser Harness

Markdown/TXT fixture를 구조화된 text block과 evidence anchor로 변환하는지 검증합니다. 손상된 fixture는 전체 분석을 깨지 않고 제어된 실패로 반환해야 합니다.

### Extraction Harness

사업 메타데이터, 요구사항, 분류, 근거 참조, 사람 검토 플래그가 안정적으로 생성되는지 검증합니다.

### Estimation Harness

요구사항 기반 공수, FP 후보, KOSA 검토 기준, ISBSG 범위, 조달 예산 역산, 내부 과거 프로젝트 보정 경계를 검증합니다.

### Package Builder Harness

Small / Medium / Large 패키지의 포함 항목, 총 MM, 리스크, 신뢰도, 권장 패키지가 산출되는지 검증합니다.

### Report Harness

한국어 제안 검토 보고서와 한국어 메일 초안이 필수 섹션과 근거 부록을 포함하는지 검증합니다.

### Sharing Harness

공유 권한, 만료일, 파생 재산정 버전 생성, 원본 불변성을 검증합니다.

### UI Harness

모바일 360px 기준 한국어 UI copy, 접근성 이름, 터치 타깃, 핵심 화면 노출을 검증합니다.

## 표준 명령

```bash
npm run harness
```

## 필수 품질 명령

```bash
npm run lint
npm run typecheck
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:a11y
npm run harness
npm run build
```

## 결과물

`npm run harness`가 성공하면 다음 파일을 생성합니다.

- `harness/reports/harness-summary.json`
- `harness/reports/sample-public-si-rfp.report.md`
- `harness/reports/sample-public-si-rfp.email.txt`

## 현재 MVP 경계

실제 HWP/HWPX/DOCX/PDF 파서는 아직 구현하지 않았습니다. 대신 동일 인터페이스 뒤에서 Markdown/TXT fixture 파서를 사용해 전체 분석 흐름을 결정적으로 검증합니다.
