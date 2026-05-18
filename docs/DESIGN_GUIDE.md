# MOLI Public Proposal Agent — Mobile Design Guide

> Product codename: **MOLI Public Proposal Agent**
> Korean service name: **몰리 공공제안 에이전트**
> Version: 1.0
> Target handoff: Figma / Pigma-style design implementation
> UI language: Korean
> Report and generated document language: English
> Platform: Mobile-first responsive web

---

## 1. Design Principle

This product must feel like a serious public-sector proposal workbench, not a casual chatbot.

The core design principle is:

> Show the estimate, show the basis, and let the user override assumptions safely.

Users are not asking for a poetic AI answer. They are making bid/no-bid and proposal planning decisions. The interface must make uncertainty, evidence, and risk visible.

---

## 2. Product Personality

### 2.1 Tone

The UI should be:

- Clear
- Calm
- Professional
- Evidence-oriented
- Fast to scan
- Low-noise
- Suitable for internal banking and public-sector proposal work

Avoid:

- Cute chatbot tone
- Overly playful character usage
- Excessive gradients
- AI magic visuals
- Unverifiable confidence
- Empty dashboard decoration

### 2.2 Brand Feel

The product may use a Shinhan-inspired visual direction, but actual brand usage should be approved internally before external release.

Recommended feeling:

- Shinhan Blue-based trust
- White and light-gray workspace
- Soft but serious cards
- Small MOLI-inspired warmth only in empty states or helper illustrations
- Financial dashboard-like clarity

---

## 3. Visual Identity

## 3.1 Color Tokens

Use these as design tokens, not hard-coded random colors.

```css
:root {
  --color-primary: #0046ff;
  --color-primary-pressed: #0036c7;
  --color-primary-soft: #eaf0ff;

  --color-navy: #101828;
  --color-text: #1d2939;
  --color-text-muted: #667085;
  --color-text-subtle: #98a2b3;

  --color-background: #f6f8fb;
  --color-surface: #ffffff;
  --color-surface-raised: #ffffff;
  --color-border: #e4e7ec;
  --color-border-strong: #d0d5dd;

  --color-success: #039855;
  --color-success-soft: #ecfdf3;

  --color-warning: #dc6803;
  --color-warning-soft: #fffaeb;

  --color-danger: #d92d20;
  --color-danger-soft: #fef3f2;

  --color-info: #1570ef;
  --color-info-soft: #eff8ff;

  --color-ai: #7a5af8;
  --color-ai-soft: #f4f3ff;
}
```

### Usage

- Primary CTA: `--color-primary`
- Selected package: primary border + soft background
- AI recommendation: purple / AI token
- Risk: warning or danger
- Evidence / source: info
- Success parse state: success
- Unknown / needs review: warning

Do not use color alone to communicate status. Always pair color with text and icon.

---

## 4. Typography

## 4.1 Font Stack

Preferred:

```css
font-family:
  "One Shinhan", "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", system-ui,
  sans-serif;
```

Fallback must work even if One Shinhan is not available.

## 4.2 Type Scale

```css
--font-display: 28px;
--font-title-1: 24px;
--font-title-2: 20px;
--font-title-3: 18px;
--font-body-1: 16px;
--font-body-2: 14px;
--font-caption: 12px;
--font-micro: 11px;
```

### Mobile Rules

- Body text should not go below 14px.
- Caption text can be 12px only for metadata.
- Important numbers should use 20–28px.
- Dense evidence text should be collapsible.

---

## 5. Layout System

## 5.1 Mobile-first Frame

Base mobile width:

- Minimum supported width: 360px
- Design artboard: 390px × 844px
- Responsive expansion: tablet and desktop later

### Page Structure

```text
[Top App Bar]
[Main Content]
[Sticky Bottom Action / Summary Bar]
```

### Spacing Tokens

```css
--space-4: 4px;
--space-8: 8px;
--space-12: 12px;
--space-16: 16px;
--space-20: 20px;
--space-24: 24px;
--space-32: 32px;
```

### Content Padding

- Mobile page horizontal padding: 16px
- Card padding: 16px
- Dense card padding: 12px
- Bottom safe area: include iOS safe area inset

---

## 6. Component Style

## 6.1 Cards

Cards are the main container.

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(16, 24, 40, 0.04);
  padding: 16px;
}
```

Card hierarchy:

- Summary card: large, high emphasis
- Requirement card: medium density
- Evidence card: compact
- Package card: selectable
- Risk card: strong status badge

## 6.2 Buttons

### Primary Button

Korean label examples:

- 새 분석 시작
- 분석 시작
- 다음 단계
- 레포트 생성
- 공유하기

Style:

- Height: 52px
- Radius: 16px
- Full width on mobile
- Primary blue background
- White text
- Loading state required

### Secondary Button

Labels:

- 임시저장
- 다시 업로드
- 근거 보기
- 항목 추가
- 복사하기

Style:

- Height: 44px
- Border
- White background
- Navy text

### Destructive Button

Labels:

- 삭제
- 링크 만료
- 업로드 취소

Use only when needed.

## 6.3 Inputs

Input height: 48px
Radius: 14px
Border: light gray
Focus border: primary blue
Error border: danger

Required input labels must be visible. Do not rely on placeholder only.

Example:

```text
공고문 URL
나라장터 또는 공공기관 입찰공고 URL을 입력하세요.
```

## 6.4 Segmented Control

Used for package selection.

Options:

- Small
- Medium
- Large

Korean UI labels:

- Small
- Medium
- Large

Subtext can be Korean:

- 최소 범위
- 균형 제안
- 전략 제안

The selected segment should be obvious by background, border, and check icon.

---

## 7. Navigation

## 7.1 Top App Bar

Mobile top app bar:

- Left: back button or product mark
- Center/left: page title
- Right: menu or help
- Height: 56px
- Sticky
- Background: translucent white with blur is allowed, but keep contrast readable

Example titles:

- 새 분석
- 문서 업로드
- 분석 결과
- 공수 산정
- 패키지 비교
- 레포트 미리보기
- 공유 설정

## 7.2 Bottom Summary Bar

The checklist and package screens need a sticky bottom bar.

Content:

- Total MM
- Package name
- Primary CTA

Example:

```text
총 42.5 MM · Medium
[레포트 생성]
```

Design:

- Fixed bottom
- White background
- Top border
- Safe area padding
- CTA on right or full-width below summary

---

## 8. Main Screens

## 8.1 Home / Analysis List

### Purpose

Let users start a new analysis and reopen previous analyses.

### Key Elements

- Product title: 쏠몰리 공공제안 에이전트
- Short description
- Primary CTA: 새 분석 시작
- Recent analysis list
- Status badge:
  - 분석중
  - 검토 필요
  - 레포트 생성됨
  - 공유됨

### Empty State

Text:

```text
아직 분석한 공고가 없습니다.
공고문 URL과 RFP 문서를 업로드해 제안 검토를 시작하세요.
```

CTA:

```text
새 분석 시작
```

Visual:

- Minimal MOLI-inspired assistant icon
- No excessive mascot dominance

---

## 8.2 New Analysis Screen

### Purpose

Collect URL and RFP files.

### Layout

1. Page title
2. URL input card
3. File upload card
4. Analysis mode card
5. Bottom CTA

### Korean UI Copy

```text
공고문 URL
나라장터 또는 공공기관 입찰공고 URL을 입력하세요.

RFP 문서 업로드
HWP, HWPX, DOCX, PDF 파일을 업로드할 수 있습니다.

분석 방식
빠른 검토
표준 분석
상세 산정
```

Primary CTA:

```text
분석 시작
```

### Validation States

- URL missing: allowed if file exists
- File missing: block analysis
- Unsupported file: show reason and retry
- Large file: show upload progress

---

## 8.3 Upload Progress Screen

### Purpose

Show transparent parsing progress.

### Stages

1. 파일 업로드 중
2. 문서 형식 확인
3. 본문 추출
4. 표·목차 분석
5. 요구사항 정리
6. 공수 산정 준비

### UI Pattern

Use a vertical progress timeline. Each stage has:

- Icon
- Label
- Status
- Short detail

Avoid fake precision like "97%" unless backed by real progress.

---

## 8.4 Parsing Result Review

### Purpose

Let the user verify extracted project metadata before estimate calculation.

### Sections

- 사업명
- 발주기관
- 사업예산
- 계약기간
- 제안 마감일
- 입찰 방식
- 주요 과업 범위
- 누락/확인 필요 항목

### Interaction

- User can edit fields.
- Edited values are marked as user override.
- Unknown values show **확인 필요**.

---

## 8.5 Analysis Summary Dashboard

### Purpose

Give fast bid/no-bid overview.

### Cards

#### Main Summary Card

```text
예상 공수
42.5 MM
범위 35.0–52.0 MM
신뢰도 78%
```

#### Risk Card

```text
리스크
높음
보안 요구사항과 데이터 이관 범위가 불명확합니다.
```

#### Budget Adequacy Card

```text
예산 적정성
주의
현재 요구사항 기준 예산 대비 공수 여유가 낮습니다.
```

#### Recommendation Card

```text
AI 검토 의견
Medium 패키지 기준 제안 검토를 권장합니다.
```

---

## 8.6 Checklist Workbench

### Purpose

Core screen where users review and tune requirements, infrastructure, proposal items, and MM.

### Requirement Card Layout

```text
[checkbox] 통합 관리자 화면 구축       [추천]
기능 요구사항 · 4.5 MM · 신뢰도 82%

근거 3개 · 리스크 보통
[근거 보기] [수정]
```

### Expanded Card

When expanded, show:

- Description
- MM min/recommended/max
- Role split
- AI recommendation reason
- Evidence summary
- Assumptions
- Risk
- Edit controls

### Required Badges

- 필수
- 선택
- 추천
- 비추천
- 검토 필요
- 근거 부족
- 사용자 추가

### Filters

Sticky filter chips:

- 전체
- 필수
- 기능
- 인프라
- 보안
- 제안 아이템
- 검토 필요

### Sort Options

- 공수 높은순
- 리스크 높은순
- 추천 우선
- 문서 순서
- 신뢰도 낮은순

---

## 8.7 Evidence Drawer

### Purpose

Show exactly why the AI extracted or estimated an item.

### Trigger

- Tap **근거 보기**
- Tap evidence count
- Tap confidence badge

### Drawer Content

```text
근거 문서
제안요청서.pdf · p.12

원문 발췌
"...통합 관리자 화면을 구축하고 권한별 접근 제어를 제공해야 한다..."

해석
관리자 화면 구축은 기능 요구사항이며, 권한 제어는 보안 요구사항에도 영향을 줍니다.

산정 근거
기능 복잡도: Medium
기본 공수: 3.0 MM
보안/권한 보정: +1.0 MM
테스트/문서화 보정: +0.5 MM
```

### Design Rules

- Evidence quote should be visually distinct.
- Show source file and page clearly.
- Long quotes are collapsed by default.
- Include **원문 위치 보기** action if source preview exists.

---

## 8.8 Package Comparison Screen

### Purpose

Help user choose Small / Medium / Large.

### Package Cards

Each card shows:

- Package name
- Recommended use case
- Total MM
- Requirement count
- Infrastructure count
- Proposal item count
- Risk level
- Delivery confidence

Example:

```text
Medium
균형 제안
42.5 MM
필수 28개 · 제안 아이템 6개
리스크 보통 · 신뢰도 78%
[선택]
```

### Comparison Detail

Use stacked cards instead of large tables on mobile.

Comparison sections:

- 포함 범위
- 제외 항목
- 추가 제안 아이템
- 예상 공수
- 주요 리스크
- 추천 사유

---

## 8.9 Report Preview

### Purpose

Preview generated English report while retaining Korean UI controls.

### UI Labels in Korean

- 레포트 미리보기
- 요약
- 공수 산정
- WBS
- 리스크
- 메일 초안
- 복사
- 다운로드
- 공유하기

### Report Body in English

Example:

```text
Executive Summary

This RFP appears suitable for a Medium package bid strategy. The estimated delivery effort is 42.5 MM, with a plausible range of 35.0–52.0 MM...
```

### Design

- Use document preview card
- Section jump navigation
- Copy button per section
- Sticky bottom **공유하기** CTA

---

## 8.10 Email Draft Screen

### Purpose

Let user review and copy/send an English email draft.

### Korean UI Controls

- 제목
- 본문
- 복사하기
- 메일 앱으로 열기
- 다시 생성

### Email Content Language

English only.

### Safety

Direct send is not part of MVP unless explicitly integrated with approved email system.

---

## 8.11 Share Settings

### Purpose

Let user control link permissions.

### Permission Options

```text
보기 전용
레포트만 확인할 수 있습니다.

재산정 가능
체크리스트를 변경해 파생 견적을 만들 수 있습니다.

내부 검토자
댓글과 수정 제안을 남길 수 있습니다.
```

### Expiration Options

- 1일
- 7일
- 30일
- 직접 설정

### Security Copy

```text
공유 링크는 원본 분석을 직접 수정하지 않습니다.
재산정 결과는 별도 버전으로 저장됩니다.
```

---

## 8.12 Shared Report View

### Purpose

Allow recipients to review report and optionally recalculate.

### View-only Mode

- Report
- Evidence
- Package summary
- No editing

### Editable Mode

- Checklist item toggles
- Complexity edit
- Recalculate button
- Derived version banner

Banner:

```text
공유된 분석을 기반으로 재산정 중입니다.
변경 내용은 원본에 반영되지 않습니다.
```

---

## 8.13 Admin Historical Data Screen

### Purpose

Allow future calibration with internal actual project effort data.

### Fields

- 프로젝트명
- 기관 유형
- 업무 도메인
- 사업 유형
- 계약금액
- 계약기간
- 실제 투입 공수
- 역할별 투입 비율
- 주요 기술
- 산출물 범위
- 성공/지연 여부
- 비고
- 익명화 여부

### Design

- Dense but clean form
- Use section cards
- Show calibration status
- Show data quality score

---

## 9. Component Specifications

## 9.1 Status Badge

Statuses:

```text
분석중
완료
검토 필요
근거 부족
공유됨
만료됨
```

Design:

- Rounded pill
- Icon + text
- No color-only meaning

## 9.2 Confidence Indicator

Use text and progress bar.

Examples:

```text
신뢰도 82%
신뢰도 낮음 · 검토 필요
```

Thresholds:

- 80–100: high
- 60–79: medium
- 0–59: low

## 9.3 Risk Indicator

Risk labels:

- 낮음
- 보통
- 높음

Risk indicator must include reason.

Bad example:

```text
리스크 높음
```

Good example:

```text
리스크 높음
데이터 이관 범위와 외부 연계 건수가 명확하지 않습니다.
```

## 9.4 MM Display

Use clear numeric hierarchy.

Examples:

```text
42.5 MM
35.0–52.0 MM
+3.5 MM
```

Rules:

- Always include unit MM.
- Use one decimal place.
- Show range when estimate uncertainty exists.
- Show delta after toggle or override.

## 9.5 Role Split

Display as stacked chips or compact bars.

Roles:

- PM
- Architect
- Backend
- Frontend
- Data
- Infra
- Security
- QA

Mobile display example:

```text
Backend 12.0 · Frontend 8.0 · PM 5.0 · QA 4.5
```

---

## 10. Interaction Rules

## 10.1 Recalculation Feedback

When user changes checklist:

- Show immediate total MM delta.
- Mark package as custom if changed from preset.
- Do not navigate away.
- Save automatically as draft.

Example toast:

```text
견적이 재산정되었습니다. Medium 기준에서 +2.0 MM 변경되었습니다.
```

## 10.2 User Overrides

When user overrides AI estimate:

- Show **사용자 수정** badge.
- Preserve original AI value.
- Allow reset to AI estimate.

Example:

```text
AI 산정 4.5 MM → 사용자 수정 6.0 MM
```

## 10.3 Human Review

When confidence is low:

- Highlight item softly.
- Use **검토 필요** badge.
- Show what is missing.

Example:

```text
검토 필요
원문에서 데이터 이관 대상 건수가 명확하지 않습니다.
```

---

## 11. Accessibility Requirements

Follow KWCAG 2.2 / WCAG 2.2 principles.

### Required

- All buttons have accessible names.
- Icon-only buttons have labels.
- Minimum touch target: 44px.
- Visible focus ring.
- No status represented by color alone.
- Form errors include correction guidance.
- Drawer can be closed by keyboard and visible close button.
- Bottom sheet does not trap focus incorrectly.
- Contrast ratio should meet accessibility standards.
- Dynamic recalculation updates should be announced to screen readers if implemented.

### Korean Error Copy Examples

```text
지원하지 않는 파일 형식입니다. HWP, HWPX, DOCX, PDF 파일을 업로드하세요.
```

```text
공수 값을 숫자로 입력하세요. 예: 4.5
```

```text
공유 링크 만료일을 선택하세요.
```

---

## 12. Responsive Behavior

## 12.1 Mobile

- Single column
- Sticky bottom action
- Cards stacked vertically
- Bottom sheets for evidence and filters
- Avoid large tables

## 12.2 Tablet

- Two-column possible:
  - Left: checklist
  - Right: estimate summary
- Evidence can open as side panel

## 12.3 Desktop

- Dashboard layout
- Left navigation
- Main workbench
- Right evidence/summary panel

MVP should prioritize mobile but avoid code that blocks later desktop layout.

---

## 13. Figma / Pigma Frame List

Create the following frames:

1. `01_Home_Empty`
2. `02_Home_With_Recent`
3. `03_New_Analysis`
4. `04_File_Upload_Progress`
5. `05_Parsing_Result_Review`
6. `06_Analysis_Summary`
7. `07_Checklist_Workbench_Default`
8. `08_Checklist_Workbench_Expanded`
9. `09_Evidence_Drawer`
10. `10_Package_Comparison`
11. `11_Report_Preview`
12. `12_Email_Draft`
13. `13_Share_Settings`
14. `14_Shared_Report_View`
15. `15_Admin_Historical_Project_Data`
16. `16_Admin_Rate_Table`
17. `17_Error_Unsupported_File`
18. `18_Error_Low_Confidence`
19. `19_Loading_Analysis`
20. `20_Empty_State`

---

## 14. Design Tokens

## 14.1 Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
```

## 14.2 Shadow

```css
--shadow-card: 0 4px 16px rgba(16, 24, 40, 0.04);
--shadow-raised: 0 8px 24px rgba(16, 24, 40, 0.08);
--shadow-bottom-bar: 0 -8px 24px rgba(16, 24, 40, 0.08);
```

## 14.3 Motion

Use restrained motion.

- Page transition: 160ms
- Drawer open: 220ms
- Button feedback: 100ms
- Recalculation number change: 180ms

Avoid playful bouncing.

---

## 15. Korean UI Copy Library

## 15.1 Primary Actions

```text
새 분석 시작
분석 시작
다음 단계
공수 재산정
레포트 생성
메일 초안 생성
공유하기
복사하기
다운로드
저장
```

## 15.2 Secondary Actions

```text
근거 보기
수정
초기화
항목 추가
필터
정렬
다시 업로드
임시저장
```

## 15.3 Status

```text
분석중
분석 완료
검토 필요
근거 부족
사용자 수정
공유됨
만료됨
```

## 15.4 Recommendation Labels

```text
강력 추천
추천
선택
비추천
검토 필요
```

## 15.5 Section Titles

```text
사업 개요
요구사항
공수 산정
인프라
제안 아이템
패키지 비교
WBS
리스크
산출 근거
메일 초안
공유 설정
```

---

## 16. Report Preview Design

Although the report content is English, the preview frame should preserve Korean navigation.

### Example

```text
[레포트 미리보기]

Executive Summary
This RFP appears suitable for a Medium package bid strategy...

[복사하기] [공유하기]
```

### Design Rule

Never translate generated English report back into Korean unless user explicitly requests it. The product requirement is English prompt/result document generation.

---

## 17. Empty, Loading, and Error States

## 17.1 Empty State

Use clear next action.

```text
분석할 RFP 문서를 업로드하세요.
공고문 URL을 함께 입력하면 사업 정보 추출 정확도가 높아집니다.
```

## 17.2 Loading State

Use real-stage loading rather than fake AI animation.

```text
문서 본문을 추출하고 있습니다.
표와 요구사항 구조를 함께 분석합니다.
```

## 17.3 Error State

Must include recovery action.

```text
문서를 분석하지 못했습니다.
파일이 암호화되어 있거나 스캔 이미지일 수 있습니다. PDF로 변환해 다시 업로드하거나 OCR 분석을 시도하세요.
```

Actions:

- 다시 업로드
- OCR로 분석
- 수동 입력

---

## 18. Data Visualization

Use simple visualizations only.

Recommended:

- MM total number
- MM range bar
- Risk chips
- Role split compact bar
- Package comparison cards
- Confidence progress bar

Avoid:

- Complex charts on mobile
- Decorative AI graphs
- Pie charts with too many categories
- Dashboard clutter

---

## 19. Prototype Flow

Figma prototype should connect:

1. Home → New Analysis
2. New Analysis → Upload Progress
3. Upload Progress → Parsing Result Review
4. Parsing Result Review → Analysis Summary
5. Analysis Summary → Checklist Workbench
6. Checklist Workbench → Evidence Drawer
7. Checklist Workbench → Package Comparison
8. Package Comparison → Report Preview
9. Report Preview → Email Draft
10. Report Preview → Share Settings
11. Share Settings → Shared Report View

---

## 20. Implementation Handoff Notes

For Codex implementation, map design components to reusable UI components.

Suggested component names:

- `AppTopBar`
- `BottomSummaryBar`
- `AnalysisCard`
- `UploadDropzone`
- `ProgressTimeline`
- `ProjectSummaryCard`
- `RequirementCard`
- `EvidenceDrawer`
- `PackageSegmentedControl`
- `PackageComparisonCard`
- `MMEstimateBadge`
- `RiskBadge`
- `ConfidenceIndicator`
- `ReportPreview`
- `SharePermissionCard`
- `AdminHistoricalProjectForm`

Each component should have:

- Loading state
- Empty state if applicable
- Error state if applicable
- Mobile layout test
- Accessibility test

---

## 21. Design Definition of Done

The design is complete when:

- All main frames are prepared at 390px mobile width.
- Components use tokenized colors, spacing, typography, and radius.
- Checklist workbench supports dense data without horizontal scrolling.
- Evidence drawer clearly shows source quote and estimation basis.
- Package comparison is readable on mobile.
- Report preview shows English document content with Korean controls.
- Share settings clearly separate view-only and editable links.
- Admin historical data screen is structured but not over-designed.
- Accessibility annotations are included.
- Empty, loading, error, and low-confidence states are designed.
