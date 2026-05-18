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
