# Architecture

## Overview

몰리 공공제안 에이전트는 모바일 우선 웹 서비스입니다. 공공 RFP fixture를 파싱하고, 근거 기반 요구사항 모델로 변환한 뒤, 공수 산정과 S/M/L 패키지 비교, 한국어 보고서, 공유 재산정 흐름을 제공합니다.

## Core Modules

1. Upload simulation
2. Parser
3. Extraction
4. Evidence Store
5. Estimation Engine
6. Package Builder
7. Report Generator
8. Sharing and Versioning
9. Admin Calibration Boundary
10. Mobile UI

## Data Flow

```text
RFP fixture
  -> parser routing
  -> text blocks + evidence anchors
  -> structured extraction
  -> requirement checklist
  -> estimation engine
  -> S/M/L package builder
  -> Korean report and email draft
  -> share link
  -> derived recalculation version
```

## Trust Boundary

업로드 또는 fixture RFP 본문은 신뢰할 수 없는 데이터입니다. 문서 내부 텍스트는 시스템 지시로 실행하지 않고 근거 데이터로만 다룹니다.

## Persistence

현재 MVP는 메모리 저장소를 사용합니다. 분석 결과, 근거, 버전, 공유 링크는 서버 프로세스 동안만 유지됩니다. 실제 배포 시 문서 저장소, 추출 텍스트, 산정 버전, 공유 링크 저장소를 분리해야 합니다.
