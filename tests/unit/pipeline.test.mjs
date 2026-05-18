import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseFile, parserSupportedExtensions } from "../../src/features/parser/parser.mjs";
import { extractAnalysisModel } from "../../src/features/extraction/extraction.mjs";
import { estimateAnalysis, applyRequirementOverride } from "../../src/features/estimation/estimation.mjs";
import { buildPackages } from "../../src/features/package-builder/packageBuilder.mjs";
import { generateKoreanReport } from "../../src/features/report/reportGenerator.mjs";
import { createShareLink, recalculateSharedAnalysis } from "../../src/features/sharing/sharing.mjs";

const loadText = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");
const loadJson = async (path) => JSON.parse(await loadText(path));

test("parser routes markdown fixtures, produces text blocks, and isolates corrupt files", async () => {
  const exts = parserSupportedExtensions();
  assert.ok(exts.includes(".md"));
  assert.ok(exts.includes(".txt"));
  assert.ok(exts.includes(".hwp"));

  const content = await loadText("harness/fixtures/rfp/sample-public-si-rfp.md");
  const parsed = await parseFile({
    fileId: "file_public_si",
    fileName: "sample-public-si-rfp.md",
    content
  });

  assert.equal(parsed.parser, "markdown_fixture");
  assert.equal(parsed.status, "parsed");
  assert.ok(parsed.textBlocks.length >= 8);
  assert.ok(parsed.evidenceAnchors.length >= 8);
  assert.equal(parsed.warnings.length, 0);

  const corrupt = await loadText("harness/fixtures/rfp/sample-corrupt-file.txt");
  const failed = await parseFile({
    fileId: "file_corrupt",
    fileName: "sample-corrupt-file.txt",
    content: corrupt
  });

  assert.equal(failed.status, "failed");
  assert.match(failed.error.message, /controlled parser failure/i);
});

test("extraction keeps project metadata, classifications, and evidence references", async () => {
  const expected = await loadJson("harness/expected/sample-public-si-rfp.expected.json");
  const content = await loadText("harness/fixtures/rfp/sample-public-si-rfp.md");
  const parsed = await parseFile({ fileId: "file_public_si", fileName: expected.fixture, content });
  const analysis = extractAnalysisModel(parsed);

  assert.equal(analysis.project.title, expected.project.title);
  assert.equal(analysis.project.agency, expected.project.agency);
  assert.equal(analysis.project.budgetKRW, expected.project.budgetKRW);
  assert.ok(analysis.requirements.length >= expected.minimumRequirementCount);

  const types = new Set(analysis.requirements.map((requirement) => requirement.type));
  for (const requiredType of expected.requiredTypes) {
    assert.ok(types.has(requiredType), `missing type ${requiredType}`);
  }

  assert.ok(analysis.requirements.every((requirement) => (
    requirement.evidenceRefs.length > 0 || requirement.aiRecommendation === "human_review"
  )));
});

test("estimation exposes assumptions and preserves original values on override", async () => {
  const content = await loadText("harness/fixtures/rfp/sample-public-si-rfp.md");
  const procurementNotice = await loadJson("harness/fixtures/procurement/sample-procurement-notice.json");
  const historicalProjects = await loadJson("harness/fixtures/historical/sample-internal-projects.json");
  const parsed = await parseFile({ fileId: "file_public_si", fileName: "sample-public-si-rfp.md", content });
  const analysis = extractAnalysisModel(parsed);
  const estimated = estimateAnalysis(analysis, { procurementNotice, historicalProjects });

  assert.ok(estimated.estimation.totalMM.min > 0);
  assert.ok(estimated.estimation.totalMM.recommended > estimated.estimation.totalMM.min);
  assert.ok(estimated.estimation.totalMM.max > estimated.estimation.totalMM.recommended);
  assert.ok(estimated.estimation.assumptions.some((item) => item.layer === "KOSA"));
  assert.ok(estimated.estimation.assumptions.some((item) => item.layer === "ISBSG"));
  assert.ok(estimated.estimation.assumptions.some((item) => item.layer === "Procurement reverse"));

  const target = estimated.requirements.find((requirement) => requirement.type === "proposal_item");
  const original = target.estimatedMM.recommended;
  const overridden = applyRequirementOverride(estimated, target.id, {
    included: true,
    estimatedMM: 6.5,
    reason: "제안 차별화 항목을 확대하기로 결정"
  });
  const changed = overridden.requirements.find((requirement) => requirement.id === target.id);

  assert.equal(changed.userOverride.estimatedMM, 6.5);
  assert.equal(changed.userOverride.originalAIValue, original);
  assert.match(changed.userOverride.reason, /제안 차별화/);
  assert.ok(overridden.versions.some((version) => version.event === "manual_mm_override"));
});

test("package builder recommends the expected preset and recalculates totals", async () => {
  const expected = await loadJson("harness/expected/sample-public-si-rfp.expected.json");
  const content = await loadText("harness/fixtures/rfp/sample-public-si-rfp.md");
  const parsed = await parseFile({ fileId: "file_public_si", fileName: expected.fixture, content });
  const analysis = estimateAnalysis(extractAnalysisModel(parsed));
  const packaged = buildPackages(analysis);

  assert.equal(packaged.packageSummary.recommendedPackage, expected.recommendedPackage);
  assert.ok(packaged.packages.S.totalMM.recommended < packaged.packages.M.totalMM.recommended);
  assert.ok(packaged.packages.M.totalMM.recommended <= packaged.packages.L.totalMM.recommended);
  assert.ok(packaged.packages.M.includedRequirementIds.length > packaged.packages.S.includedRequirementIds.length);
});

test("report generator returns a Korean report and Korean email draft", async () => {
  const content = await loadText("harness/fixtures/rfp/sample-public-si-rfp.md");
  const parsed = await parseFile({ fileId: "file_public_si", fileName: "sample-public-si-rfp.md", content });
  const analysis = buildPackages(estimateAnalysis(extractAnalysisModel(parsed)));
  const report = generateKoreanReport(analysis);

  assert.equal(report.language, "ko");
  assert.match(report.markdown, /## 경영진 요약/);
  assert.match(report.markdown, /## 산정 방법론/);
  assert.match(report.markdown, /## 근거 부록/);
  assert.doesNotMatch(report.markdown, /Executive Summary/);
  assert.match(report.emailDraft.subject, /제안 검토/);
  assert.match(report.emailDraft.body, /안녕하세요/);
});

test("sharing creates derived recalculations without mutating the original analysis", async () => {
  const content = await loadText("harness/fixtures/rfp/sample-public-si-rfp.md");
  const parsed = await parseFile({ fileId: "file_public_si", fileName: "sample-public-si-rfp.md", content });
  const analysis = buildPackages(estimateAnalysis(extractAnalysisModel(parsed)));
  const report = generateKoreanReport(analysis);
  const original = { ...analysis, report };
  const share = createShareLink(original, {
    permission: "editable_recalculation",
    expiresInDays: 7
  });

  const optional = original.requirements.find((requirement) => !requirement.mandatory);
  const derived = recalculateSharedAnalysis(original, share, {
    requirementId: optional.id,
    included: false
  });

  assert.equal(share.permission, "editable_recalculation");
  assert.equal(original.requirements.find((requirement) => requirement.id === optional.id).included, true);
  assert.equal(derived.parentAnalysisId, original.id);
  assert.notEqual(derived.id, original.id);
  assert.ok(derived.versions.some((version) => version.event === "shared_recalculation"));
});
