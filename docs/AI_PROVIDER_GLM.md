# GLM AI Provider 설정

## 목적

MVP의 문서 파싱, 요구사항 추출, 산정, 보고서 생성 흐름은 현재 fixture와 결정적 규칙으로 동작한다. 따라서 샘플 문서를 분석하고 하네스를 실행하는 데 GLM API Key는 필요하지 않다.

실제 업로드 문서의 품질을 높이려면 GLM API Key를 서버 환경 변수로 설정하고, 규칙 기반 파서가 만든 텍스트 블록과 근거 앵커 위에 AI 보강 단계를 붙인다.

## 환경 변수

| 이름 | 기본값 | 용도 |
| --- | --- | --- |
| `MOLI_ENABLE_LLM` | `false` | LLM 어댑터를 켠다. 켜면 보고서 생성 시 GLM 보강 단계가 실행된다. |
| `MOLI_ENABLE_GLM_ANALYSIS` | `false` | (deprecated) `MOLI_ENABLE_LLM` 의 하위호환 별칭. 새 플래그가 있으면 무시된다. |
| `MOLI_LLM_PROVIDER` | `glm` | 어댑터 provider 라벨. 현재 OpenAI 호환 GLM 엔드포인트만 지원한다. |
| `MOLI_LLM_TIMEOUT_MS` | `20000` | LLM 호출 타임아웃(ms). 초과 시 결정적 파이프라인으로 폴백한다. |
| `GLM_API_KEY` | 없음 | 서버에서만 읽는 Z.AI/GLM API 키다. |
| `GLM_BASE_URL` | `https://open.bigmodel.cn/api/paas/v4` | OpenAI 호환 GLM API 엔드포인트 기본값이다. |
| `GLM_MODEL` | `glm-4.5` | 텍스트 추출, 요구사항 정규화, 보고서 보강 모델이다. |
| `GLM_VISION_MODEL` | `glm-4.5v` | 이미지/PDF 렌더링 페이지 OCR 보강 후보 모델이다. |
| `MOLI_ENABLE_GLM_VISION_MCP` | `false` | Vision MCP 실험 경로를 명시적으로 켠다. |
| `GLM_VISION_MCP_SERVER_URL` | 없음 | 원격 MCP 게이트웨이를 별도로 둘 때만 지정한다. Z.AI 문서의 기본 방식은 로컬 stdio MCP다. |

## 노출 정책

GLM API Key 원문 키는 API 응답이나 브라우저에 노출되지 않는다. `/api/runtime/config`는 설정 여부와 짧은 마스킹 프리뷰만 반환하며, 실제 호출용 키는 서버 런타임 내부 값으로만 유지한다.

브라우저에서 직접 GLM API를 호출하지 않는다. 업로드 문서, OCR 이미지, RFP 본문, 산정 근거는 서버 측 보강 어댑터를 통해서만 외부 AI 모델로 전달한다.

## 동작 원칙

1. 규칙 기반 파싱을 먼저 실행해 텍스트 블록, 페이지/문단 앵커, 원문 인용 후보를 만든다.
2. GLM 보강 단계는 누락 가능성이 큰 표, 조건, 제출물, 일정, 보안 요구사항을 구조화한다.
3. AI가 새 요구사항을 만들 때는 반드시 원문 근거 앵커 또는 사람 검토 플래그를 남긴다.
4. GLM 호출 실패, 쿼터 초과, 네트워크 오류가 발생하면 기존 결정적 파이프라인으로 폴백한다.
5. 보고서 품질 개선은 표현과 요약 구조에 집중하고, 산정 숫자는 기존 산정 엔진의 결과를 기준으로 삼는다.

## LLM 어댑터 구현 (src/features/llm/llmAdapter.mjs)

`MOLI_ENABLE_LLM=true` + `GLM_API_KEY` 가 설정되면 `POST /api/analysis/:id/report` 는
결정적 보고서를 만든 뒤 어댑터의 `enhanceReport()` 를 호출한다.

- 성공: 보고서 마크다운의 `## 경영진 요약` 앞에 `## AI 보강 요약` 섹션이 삽입되고,
  응답에 `aiEnhancement: { enabled: true, summaryKO, insights, model, latencyMs }` 가 붙는다.
- 실패/비활성: 보고서는 결정적 결과 그대로이며 `aiEnhancement: { enabled: false, reason }` 만 붙는다.
  플래그 꺼짐, 키 없음, HTTP 오류, 타임아웃, 파싱 실패 모두 같은 폴백을 탄다.
- 산정 숫자는 프롬프트에서 고정 인용하도록 지시하며, 어댑터는 숫자를 재계산하지 않는다.
- 호출 형식은 OpenAI 호환 `chat/completions` 이므로 `GLM_BASE_URL` 교체만으로
  다른 OpenAI 호환 엔드포인트에도 연결할 수 있다.
- 상태 확인: `GET /api/runtime/config` 의 `llm.enabled / llm.ready / llm.model` 필드.
- 테스트: `tests/unit/llm-adapter.test.mjs` (플래그, 폴백, 파싱, 키 비노출).

## 배포 체크

Vercel에서는 Production, Preview, Development 환경별로 같은 키 이름을 등록한다. Supabase `service_role` 키와 GLM API Key는 서버 함수에서만 읽고, 클라이언트 번들에 주입하지 않는다.

참고 문서:

- Z.AI Vision MCP Server: https://docs.z.ai/devpack/mcp/vision-mcp-server
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
