# Accessibility

## Standard

KWCAG 2.2 / WCAG 2.2 원칙을 따릅니다.

## Checks

- 키보드 접근 가능한 버튼
- 보이는 focus state
- 아이콘 버튼의 접근성 이름
- 입력 label
- 오류 안내 문구
- 색상만으로 의미 전달 금지
- 44px 이상 터치 타깃
- 360px 모바일 viewport 지원
- 하단 sticky CTA 접근 가능

## Current Verification

`npm run test:a11y`는 한국어 UI copy, 접근성 label, 모바일 overflow 방지, touch target CSS를 검증합니다.
