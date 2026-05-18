# 몰리 공공제안 에이전트

공공 RFP 문서를 하네스 샘플로 분석해 요구사항, 근거, 공수 산정, 패키지 비교, 한국어 제안 검토 보고서, 공유 재산정 흐름을 검증하는 모바일 우선 웹 서비스입니다.

## 실행

```bash
npm run dev
```

기본 주소는 `http://127.0.0.1:3000`입니다. 현재 구현은 외부 패키지 없이 Node 내장 API와 브라우저 표준 기능만 사용합니다.

환경 변수는 `.env.example`을 기준으로 설정합니다. GLM 보강은 기본적으로 꺼져 있으며, 실제 문서 품질 개선 실험을 시작할 때 `GLM_API_KEY`와 `MOLI_ENABLE_GLM_ANALYSIS=true`를 서버 환경에 등록합니다. 키 원문은 브라우저 API 응답으로 노출하지 않습니다.

## 검증

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

`npm run harness`는 파서, 추출, 산정, 패키지, 레포트, 공유, UI 하네스를 실행하고 `harness/reports/`에 한국어 샘플 보고서와 요약 JSON을 생성합니다.

## MVP 흐름

1. 새 분석 시작
2. 샘플 RFP 업로드 시뮬레이션
3. Markdown/TXT 파서로 본문과 근거 앵커 생성
4. 요구사항 분류와 사람 검토 플래그 생성
5. 다층 공수 산정과 S/M/L 패키지 비교
6. 한국어 보고서와 메일 초안 생성
7. 공유 링크와 파생 재산정 버전 생성

## 배포 준비

- Vercel: `vercel.json`은 `npm run build`와 `dist/` 정적 산출물을 사용합니다. `/api/*`는 `api/[...path].mjs` Vercel Function으로 처리합니다.
- Supabase: `supabase/migrations/202605180001_initial_schema.sql`에 초기 분석/파일/근거/요구사항/리포트/공유/audit 테이블과 RLS, service role `GRANT`를 포함했습니다.
- GLM: [docs/AI_PROVIDER_GLM.md](docs/AI_PROVIDER_GLM.md)에 서버 환경 변수, 키 노출 정책, 폴백 원칙을 정리했습니다.
- Vision OCR: [docs/GLM_VISION_MCP_REVIEW.md](docs/GLM_VISION_MCP_REVIEW.md)에 Z.AI Vision MCP Server 검토 결과와 운영 적용 판단을 남겼습니다.
- 단계별 배포 절차: [docs/DEPLOYMENT_VERCEL_SUPABASE.md](docs/DEPLOYMENT_VERCEL_SUPABASE.md)를 따릅니다.

## 제한 사항

실제 HWP/HWPX/DOCX/PDF 파서는 어댑터 경계만 남겨 두고, MVP는 결정적 Markdown/TXT fixture로 전체 제품 흐름을 검증합니다. 외부 조달 API, 인증, 파일 저장소, 메일 발송은 로컬 하네스 범위에 포함하지 않았습니다.
