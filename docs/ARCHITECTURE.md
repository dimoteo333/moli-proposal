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
  -> optional GLM/Vision quality enrichment
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

현재 로컬 MVP는 메모리 저장소를 사용합니다. Vercel 배포 준비를 위해 `/api/*`는 Vercel Function 진입점을 갖고, Supabase 초기 마이그레이션은 분석 결과, 파일, 근거, 요구사항, 리포트, 공유 링크, 감사 이벤트를 분리합니다.

운영 저장소로 전환할 때 원본 파일은 Supabase Storage에 두고, DB에는 storage path, checksum, evidence anchor, OCR confidence를 저장합니다. 서버 함수는 `service_role`로만 쓰기 작업을 수행하고, 클라이언트는 공개 API를 통해 필요한 상태만 받습니다.
