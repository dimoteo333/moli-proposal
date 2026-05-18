# MOLI Harness-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fixture-backed Korean mobile RFP analysis MVP with deterministic harness coverage.

**Architecture:** Use a no-dependency Node server, separated feature modules, JSON fixtures, Node test runner, and static mobile UI. The service keeps real document parsers behind a stable parser boundary.

**Tech Stack:** Node 25, ESM modules, Node built-in test runner, plain HTML/CSS/JavaScript.

---

### Task 1: Harness Fixtures and RED Tests

**Files:**
- Create: `harness/fixtures/rfp/*.md`
- Create: `harness/expected/*.json`
- Create: `tests/unit/pipeline.test.mjs`
- Create: `tests/contract/schema.test.mjs`
- Create: `tests/integration/api-flow.test.mjs`
- Create: `tests/e2e/core-flow.test.mjs`
- Create: `tests/accessibility/mobile-copy.test.mjs`

- [x] Write failing tests for parser, extraction, estimation, package builder, report, sharing, API, and UI.
- [x] Run tests and confirm missing production modules fail.

### Task 2: Core Pipeline

**Files:**
- Create: `src/features/parser/parser.mjs`
- Create: `src/features/extraction/extraction.mjs`
- Create: `src/features/estimation/estimation.mjs`
- Create: `src/features/package-builder/packageBuilder.mjs`
- Create: `src/features/report/reportGenerator.mjs`
- Create: `src/features/sharing/sharing.mjs`
- Create: `src/lib/contracts.mjs`

- [x] Implement minimal production code to pass the RED tests.
- [x] Preserve evidence references and user override history.

### Task 3: API and Mobile UI

**Files:**
- Create: `src/server/server.mjs`
- Create: `src/app/index.html`
- Create: `src/app/styles.css`
- Create: `src/app/main.js`
- Create: `public/logo.ico`

- [x] Implement fixture-backed API flow.
- [x] Implement Korean mobile UI following design tokens and logo.
- [x] Add in-process fetch fallback for sandboxed tests.

### Task 4: Scripts, Docs, and Quality Gates

**Files:**
- Create: `package.json`
- Create: `scripts/build.mjs`
- Create: `tests/tools/*.mjs`
- Create: `harness/scripts/*.sh`
- Create: `harness/scripts/summarize-results.ts`
- Create: required `docs/*.md`

- [x] Add stable command names from HARNESS.md.
- [x] Generate Korean harness report artifacts.
- [x] Document architecture, contracts, data model, estimation, parser strategy, security, accessibility, QA, decisions, and release checklist.
