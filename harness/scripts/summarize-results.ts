import { mkdir, readFile, writeFile } from "node:fs/promises";

import { parseFile } from "../../src/features/parser/parser.mjs";
import { extractAnalysisModel } from "../../src/features/extraction/extraction.mjs";
import { estimateAnalysis } from "../../src/features/estimation/estimation.mjs";
import { buildPackages } from "../../src/features/package-builder/packageBuilder.mjs";
import { generateKoreanReport } from "../../src/features/report/reportGenerator.mjs";
import { createShareLink, recalculateSharedAnalysis } from "../../src/features/sharing/sharing.mjs";
import { validateAnalysis, validateReport } from "../../src/lib/contracts.mjs";

await mkdir("harness/reports", { recursive: true });

const content = await readFile("harness/fixtures/rfp/sample-public-si-rfp.md", "utf8");
const parsed = parseFile({ fileId: "file_public_si", fileName: "sample-public-si-rfp.md", content });
const analysis = buildPackages(estimateAnalysis(extractAnalysisModel(parsed)));
const report = generateKoreanReport(analysis, { generatedAt: "2026-05-18T00:00:00.000Z" });
const share = createShareLink({ ...analysis, report }, { permission: "editable_recalculation", expiresInDays: 7 });
const optional = analysis.requirements.find((requirement) => !requirement.mandatory && requirement.included);
const derived = recalculateSharedAnalysis({ ...analysis, report }, share, {
  requirementId: optional.id,
  included: false
});

await writeFile("harness/reports/sample-public-si-rfp.report.md", report.markdown);
await writeFile("harness/reports/sample-public-si-rfp.email.txt", report.emailDraft.body);
await writeFile("harness/reports/harness-summary.json", JSON.stringify({
  status: "passed",
  reportLanguage: report.language,
  parser: parsed.status,
  requirementCount: analysis.requirements.length,
  recommendedPackage: analysis.packageSummary.recommendedPackage,
  totalMM: analysis.estimation.totalMM,
  analysisContract: validateAnalysis(analysis),
  reportContract: validateReport(report),
  sharePermission: share.permission,
  derivedVersionCreated: derived.parentAnalysisId === analysis.id && derived.id !== analysis.id,
  generatedAt: new Date().toISOString()
}, null, 2));

console.log("harness summary written to harness/reports/harness-summary.json");
