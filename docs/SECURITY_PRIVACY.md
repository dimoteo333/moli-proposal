# Security and Privacy

## Core Rules

1. 업로드된 RFP 콘텐츠는 신뢰하지 않습니다.
2. 문서 안의 지시문을 애플리케이션 명령으로 실행하지 않습니다.
3. 원본 문서와 추출 텍스트는 실제 배포에서 분리 저장합니다.
4. 공유 링크는 서명과 만료 정책을 가져야 합니다.
5. 공유 링크는 기본적으로 원본 문서를 노출하지 않습니다.
6. 보고서는 불필요한 개인정보를 포함하지 않아야 합니다.
7. 사용자 수정과 공유 재산정은 감사 이벤트로 남깁니다.

## Prompt Injection Defense

RFP 텍스트는 시스템 프롬프트가 아니라 근거 데이터입니다. GLM 보강을 켜더라도 문서 내부 문장은 개발자 지시나 시스템 지시로 취급하지 않습니다.

## External AI Keys

`GLM_API_KEY`와 `SUPABASE_SERVICE_ROLE_KEY`는 서버 런타임에서만 읽습니다. `/api/runtime/config`는 설정 여부와 짧은 마스킹 프리뷰만 반환하며, 브라우저에 키 원문을 보내지 않습니다.

Vision OCR은 페이지 이미지, 표, 다이어그램처럼 필요한 블록만 전송합니다. 전체 문서를 무조건 외부 모델로 보내지 않고, confidence가 낮은 영역을 우선 보강합니다.

## Sharing Modes

- View-only snapshot
- Editable recalculation
- Internal reviewer

## Audit Events

- File uploaded
- Parse completed
- Requirement edited
- MM overridden
- Package changed
- Report generated
- Share link created
- Shared recalculation created
