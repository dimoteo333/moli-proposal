# GLM Vision MCP Server 검토

검토일: 2026-05-18

## 공식 문서 기준 요약

Z.AI의 Vision MCP Server는 MCP 호환 클라이언트에서 GLM-4.6V 기반 이미지 분석과 비디오 이해를 사용하도록 만든 로컬 MCP 서버다. 공식 문서는 `@z_ai/mcp-server` npm 패키지, Node.js 22 이상, `Z_AI_API_KEY`, `Z_AI_MODE=ZAI` 설정을 요구한다.

문서에 나온 도구 중 몰리 문서 품질 개선과 직접 관련 있는 것은 다음이다.

| 도구 | 적용 가능성 |
| --- | --- |
| `extract_text_from_screenshot` | PDF/HWP 렌더링 페이지나 스캔 이미지 OCR 보강 후보 |
| `understand_technical_diagram` | 아키텍처, 구성도, ERD가 포함된 제안요청서 보강 후보 |
| `analyze_data_visualization` | 예산, 일정, 성과지표 표/차트 해석 보조 |
| `image_analysis` | 표지, 스캔 이미지, 품질이 낮은 캡처의 일반 해석 |
| `ui_diff_check` | 제안서 산출물 UI 검수에는 유용하지만 RFP OCR 핵심 경로는 아님 |

## 결론

Vision MCP Server는 개발자와 운영자가 로컬 또는 내부 도구에서 OCR 품질을 확인하는 보조 경로로 검토 가치가 있다. 하지만 현재 문서는 MCP 호환 클라이언트가 로컬 stdio 서버를 실행하는 방식을 중심으로 설명한다. Vercel Functions의 운영 OCR 경로에 그대로 넣기보다는, 운영에서는 서버 측 GLM Vision API 어댑터를 직접 구현하고 Vision MCP는 QA/운영 조사 도구로 분리하는 편이 안전하다.

## 권장 적용 순서

1. PDF/HWPX를 페이지 이미지와 텍스트 블록으로 렌더링하는 문서 파서 어댑터를 먼저 만든다.
2. confidence가 낮은 페이지, 표, 다이어그램만 GLM Vision 보강 대상으로 보낸다.
3. 개발 환경에서는 Vision MCP Server의 `extract_text_from_screenshot`으로 OCR 결과를 사람이 비교한다.
4. 운영 환경에서는 GLM Vision API를 서버 함수나 비동기 worker에서 호출한다.
5. OCR 보강 결과는 원문 페이지, 이미지 경로, confidence, 모델명, 재시도 횟수와 함께 저장한다.

## 설정 방식

몰리 앱의 환경 변수 이름은 기존 GLM 설정과 맞춰 `GLM_API_KEY`를 기준으로 둔다. Vision MCP를 로컬에서 실험할 때는 실행 환경에서 이를 Z.AI MCP 서버의 `Z_AI_API_KEY`로 매핑한다.

예시:

```bash
Z_AI_API_KEY="$GLM_API_KEY" Z_AI_MODE=ZAI npx -y @z_ai/mcp-server
```

Vercel 운영 환경에서는 `MOLI_ENABLE_GLM_VISION_MCP=false`를 기본값으로 둔다. 별도 MCP 게이트웨이를 운영하게 되면 `GLM_VISION_MCP_SERVER_URL`을 등록하고, 인증과 네트워크 제한을 별도 설계한다.

## 리스크

- MCP stdio 서버는 서버리스 함수의 짧은 실행 시간과 콜드 스타트 특성에 잘 맞지 않는다.
- RFP 원문에는 개인정보, 보안 구성도, 사업 예산이 포함될 수 있으므로 전체 문서를 무조건 외부 모델로 보내면 안 된다.
- OCR 결과가 요구사항 생성으로 이어질 때는 근거 앵커와 사람 검토 플래그가 필수다.
- Vision 모델 비용과 쿼터가 텍스트 보강보다 빠르게 증가할 수 있다.

참고 문서:

- Z.AI Vision MCP Server: https://docs.z.ai/devpack/mcp/vision-mcp-server
