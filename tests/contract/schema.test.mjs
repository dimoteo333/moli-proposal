import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseFile } from "../../src/features/parser/parser.mjs";
import { extractAnalysisModel } from "../../src/features/extraction/extraction.mjs";
import { estimateAnalysis } from "../../src/features/estimation/estimation.mjs";
import { buildPackages } from "../../src/features/package-builder/packageBuilder.mjs";
import { generateKoreanReport } from "../../src/features/report/reportGenerator.mjs";
import { validateAnalysis, validateReport } from "../../src/lib/contracts.mjs";

const loadText = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("analysis contract accepts the deterministic fixture pipeline", async () => {
  const content = await loadText("harness/fixtures/rfp/sample-public-si-rfp.md");
  const parsed = parseFile({ fileId: "file_public_si", fileName: "sample-public-si-rfp.md", content });
  const analysis = buildPackages(estimateAnalysis(extractAnalysisModel(parsed)));
  const result = validateAnalysis(analysis);

  assert.equal(result.valid, true, result.errors.join("\n"));
});

test("analysis contract rejects fabricated requirements without evidence or review flag", () => {
  const result = validateAnalysis({
    id: "analysis_bad",
    project: { title: "가짜 사업" },
    requirements: [
      {
        id: "req_bad",
        title: "근거 없는 요구사항",
        type: "functional",
        mandatory: true,
        aiRecommendation: "recommend",
        estimatedMM: { min: 1, recommended: 2, max: 3 },
        confidence: 0.9,
        riskLevel: "low",
        evidenceRefs: [],
        assumptions: []
      }
    ],
    estimation: { totalMM: { min: 1, recommended: 2, max: 3 }, assumptions: [] }
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("evidence")));
});

test("report contract requires Korean report sections and Korean email draft", async () => {
  const content = await loadText("harness/fixtures/rfp/sample-public-si-rfp.md");
  const parsed = parseFile({ fileId: "file_public_si", fileName: "sample-public-si-rfp.md", content });
  const analysis = buildPackages(estimateAnalysis(extractAnalysisModel(parsed)));
  const report = generateKoreanReport(analysis);

  const result = validateReport(report);
  assert.equal(result.valid, true, result.errors.join("\n"));
});
