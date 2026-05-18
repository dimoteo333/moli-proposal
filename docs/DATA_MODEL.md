# Data Model

## Analysis

```json
{
  "id": "analysis_001",
  "status": "draft | uploaded | parsed | extracted | estimated | packaged | report_generated | shared_derived",
  "sourceUrl": "string",
  "project": {},
  "requirements": [],
  "evidence": [],
  "estimation": {},
  "packages": {},
  "report": {},
  "versions": []
}
```

## Requirement

```json
{
  "id": "req_001",
  "title": "string",
  "description": "string",
  "type": "functional | non_functional | security | infrastructure | migration | documentation | proposal_item",
  "mandatory": true,
  "included": true,
  "aiRecommendation": "strong_recommend | recommend | optional | not_recommend | human_review",
  "estimatedMM": {
    "min": 0,
    "recommended": 0,
    "max": 0
  },
  "roleSplit": {},
  "confidence": 0.0,
  "riskLevel": "low | medium | high",
  "evidenceRefs": [],
  "assumptions": []
}
```

## Evidence Reference

```json
{
  "id": "ev_001",
  "sourceFileId": "file_001",
  "sourceFileName": "sample-public-si-rfp.md",
  "page": 1,
  "section": "기능 요구사항",
  "quote": "string",
  "parser": "markdown_fixture",
  "confidence": 0.88
}
```

## Share

```json
{
  "shareId": "share_001",
  "analysisId": "analysis_001",
  "permission": "view_only | editable_recalculation | internal_reviewer",
  "expiresAt": "datetime",
  "url": "/shared/share_001"
}
```
