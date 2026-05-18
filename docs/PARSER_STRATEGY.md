# Parser Strategy

## Supported MVP Formats

- Markdown fixture
- TXT fixture

## Future Parser Boundary

실제 파서는 같은 `parseFile` 계약 뒤에 추가합니다.

1. HWPX
2. DOCX
3. PDF text extraction
4. XLSX
5. OCR fallback
6. HWP binary conversion boundary

OCR fallback은 문서 전체를 바로 AI에 보내는 경로가 아닙니다. 먼저 결정적 파서가 페이지, 표, 문단, 근거 앵커를 만들고, 텍스트 추출이 낮은 confidence로 끝난 블록만 GLM Vision 보강 후보로 보냅니다.

## Parser Output Contract

```json
{
  "fileId": "string",
  "fileName": "string",
  "parser": "markdown_fixture",
  "status": "parsed | failed",
  "textBlocks": [],
  "tables": [],
  "evidenceAnchors": [],
  "confidence": 0.0,
  "warnings": []
}
```

## Failure Policy

파일 하나가 실패해도 전체 분석을 즉시 실패시키지 않습니다. 하나 이상의 유효한 파싱 결과가 있으면 추출을 계속할 수 있습니다.

GLM 또는 Vision OCR 호출이 실패해도 기존 파싱 결과를 폐기하지 않습니다. 보강 단계는 `warnings`와 `review_required` 플래그를 남기고 결정적 파이프라인으로 폴백합니다.
