# Estimation Methodology

## Goal

산정 엔진은 단일 불투명 숫자가 아니라 최소, 권장, 최대 MM 범위와 그 근거를 생성합니다.

## Layers

1. Requirement-based estimate
2. Function Point candidate estimate
3. KOSA guide-based review assumption
4. ISBSG productivity range assumption
5. Public procurement reverse estimation
6. Internal historical calibration boundary

## Formula Policy

하드코딩된 단일 계수만으로 산정하지 않습니다. MVP는 요구사항 유형별 기준값, 키워드 보정, 리스크 보정, 예산 역산 레이어를 조합합니다.

## User Override Policy

사용자 수정은 다음 값을 보존합니다.

- 원래 AI 산정값
- 사용자 수정값
- 수정 사유
- 수정 시각
- 버전 이벤트
