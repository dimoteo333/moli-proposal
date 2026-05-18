# API Contracts

## POST /api/analysis

새 분석을 만듭니다.

### Request

```json
{
  "sourceUrl": "string",
  "analysisMode": "quick | standard | detailed",
  "projectCategory": "string"
}
```

### Response

```json
{
  "analysisId": "string",
  "status": "draft"
}
```

## POST /api/analysis/:id/files

RFP fixture 파일을 분석에 연결합니다.

## POST /api/analysis/:id/parse

파서 파이프라인을 실행합니다.

## POST /api/analysis/:id/extract

구조화 추출을 실행합니다.

## POST /api/analysis/:id/estimate

공수 산정과 패키지 생성을 실행합니다.

## PATCH /api/analysis/:id/requirements/:requirementId

요구사항 포함 여부 또는 사용자 MM 수정을 반영합니다.

## POST /api/analysis/:id/report

한국어 제안 검토 보고서와 메일 초안을 생성합니다.

## POST /api/analysis/:id/share

공유 링크를 생성합니다.

## POST /api/shared/:shareId/recalculate

공유 링크에서 파생 재산정 버전을 생성합니다. 원본 분석은 변경하지 않습니다.
