# Vercel 및 Supabase 배포 절차

## 현재 배포 형태

이 저장소는 외부 패키지 없이 Node 내장 API와 정적 프런트엔드로 동작한다. `npm run build`는 `dist/`에 정적 파일을 만들고, `api/[...path].mjs`는 Vercel Functions에서 `/api/*` 요청을 처리한다.

분석 데이터는 아직 서버 메모리 저장소를 기본값으로 사용한다. 운영 배포에서는 아래 Supabase 마이그레이션을 먼저 적용하고, 다음 단계에서 저장소 어댑터를 Supabase로 교체한다.

## 1. Vercel 프로젝트 설정

1. GitHub 저장소를 Vercel 프로젝트로 연결한다.
2. Build Command는 `npm run build`, Output Directory는 `dist`로 둔다.
3. Node.js 버전은 `package.json`의 `engines.node`에 맞춰 25 이상을 사용한다.
4. 환경 변수는 Production, Preview, Development에 각각 등록한다.

필수 환경 변수:

| 이름 | 값 |
| --- | --- |
| `MOLI_ENABLE_GLM_ANALYSIS` | 운영 전까지 `false`, GLM 보강 검증 뒤 `true` |
| `GLM_API_KEY` | Z.AI 콘솔에서 발급한 키 |
| `GLM_BASE_URL` | `https://open.bigmodel.cn/api/paas/v4` |
| `GLM_MODEL` | `glm-4.5` |
| `GLM_VISION_MODEL` | `glm-4.5v` |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | 브라우저 공개 가능 anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 함수 전용 service role key |

`SUPABASE_SERVICE_ROLE_KEY`와 `GLM_API_KEY`는 클라이언트 번들에 넣지 않는다. `/api/runtime/config`로 설정 여부만 점검한다.

## 2. Supabase 프로젝트 설정

1. Supabase 프로젝트를 만들고 SQL Editor 또는 Supabase CLI로 `supabase/migrations/202605180001_initial_schema.sql`을 적용한다.
2. RFP 원문 파일을 보관할 Storage bucket을 만든다. 권장 이름은 `rfp-documents`다.
3. Storage 정책은 서버 업로드만 허용한다. 브라우저 직접 업로드를 열기 전에는 anon/authenticated 역할에 쓰기 권한을 부여하지 않는다.
4. Security Advisor에서 RLS 누락, 과도한 Data API 노출, service role 사용 위치를 확인한다.

Supabase는 2026-05-30부터 신규 프로젝트에서 public 테이블을 Data API에 자동 노출하지 않는 방향으로 변경된다. 그래서 마이그레이션에는 `GRANT`와 `enable row level security`를 같이 넣는다. 운영 초기는 서버 함수가 `service_role`로만 접근하므로 anon/authenticated 역할에 테이블 권한을 열지 않는다.

## 3. 배포 전 검증

```bash
npm run lint
npm run typecheck
npm run test
npm run harness
npm run build
```

로컬 서버 확인:

```bash
npm run dev
curl http://127.0.0.1:3000/api/runtime/config
```

응답에 `apiKeySet`, `serviceRoleKeySet`이 `true`로 보이더라도 키 원문이 포함되면 안 된다.

## 4. 운영 체크리스트

- GLM 호출 로그에는 문서 원문 전체 대신 analysis id, 단계, 토큰 사용량, 오류 코드만 남긴다.
- OCR 결과는 페이지 번호, 블록 id, confidence, 원문 이미지 경로를 함께 저장한다.
- 공유 링크는 만료 시각과 취소 시각을 둘 다 기록한다.
- 사람이 검토하지 않은 AI 보강 요구사항은 보고서에서 자동 확정하지 않는다.
- Vercel Preview 배포에서 GLM 보강을 먼저 켜고 샘플 RFP 4종 하네스 결과를 운영과 비교한다.

참고 문서:

- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase public schema grants change: https://supabase.com/changelog
