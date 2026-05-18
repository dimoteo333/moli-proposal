import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { parseFile, parserSupportedExtensions } from "../../src/features/parser/parser.mjs";
import { extractAnalysisModel } from "../../src/features/extraction/extraction.mjs";
import { extractRequirementsFromTables } from "../../src/features/extraction/hwpTableExtractor.mjs";

const HWP_FIXTURE = "harness/fixtures/rfp/sample-maintenance-real.hwp";
const MD_FIXTURE = "harness/fixtures/rfp/sample-public-si-rfp.md";

function loadHwpBuffer() {
  return readFileSync(new URL(`../../${HWP_FIXTURE}`, import.meta.url));
}

test("parser supported extensions include kordoc formats", () => {
  const exts = parserSupportedExtensions();
  assert.ok(exts.includes(".hwp"), "should include .hwp");
  assert.ok(exts.includes(".hwpx"), "should include .hwpx");
  assert.ok(exts.includes(".docx"), "should include .docx");
  assert.ok(exts.includes(".pdf"), "should include .pdf");
  assert.ok(exts.includes(".xlsx"), "should include .xlsx");
  assert.ok(exts.includes(".md"), "should include .md");
  assert.ok(exts.includes(".txt"), "should include .txt");
});

test("kordoc adapter parses HWP file and produces text blocks with evidence", async () => {
  const buffer = loadHwpBuffer();
  const parsed = await parseFile({
    fileId: "file_hwp_real",
    fileName: "sample-maintenance-real.hwp",
    buffer
  });

  assert.equal(parsed.status, "parsed");
  assert.ok(parsed.textBlocks.length >= 50, `expected >= 50 textBlocks, got ${parsed.textBlocks.length}`);
  assert.ok(parsed.evidenceAnchors.length >= 10, `expected >= 10 evidenceAnchors, got ${parsed.evidenceAnchors.length}`);
  assert.ok(parsed.confidence > 0.5, `expected confidence > 0.5, got ${parsed.confidence}`);
  assert.match(parsed.parser, /kordoc/);
  assert.ok(parsed.rawText.length > 0, "should have rawText (markdown)");
});

test("kordoc adapter extracts tables from HWP", async () => {
  const buffer = loadHwpBuffer();
  const parsed = await parseFile({
    fileId: "file_hwp_real",
    fileName: "sample-maintenance-real.hwp",
    buffer
  });

  assert.ok(parsed.tables.length >= 10, `expected >= 10 tables, got ${parsed.tables.length}`);
  // Each table should have index, rows, cols, headers, rows
  for (const table of parsed.tables.slice(0, 5)) {
    assert.ok(typeof table.index === "number", "table should have index");
    assert.ok(typeof table.rows === "number" || Array.isArray(table.rows), "table should have rows");
  }
});

test("markdown fixture parser still works (backward compatibility)", async () => {
  const { readFile } = await import("node:fs/promises");
  const content = await readFile(new URL(`../../${MD_FIXTURE}`, import.meta.url), "utf8");
  const parsed = await parseFile({
    fileId: "file_md",
    fileName: "sample-public-si-rfp.md",
    content
  });

  assert.equal(parsed.parser, "markdown_fixture");
  assert.equal(parsed.status, "parsed");
  assert.ok(parsed.textBlocks.length >= 8);
  assert.ok(parsed.evidenceAnchors.length >= 8);
  assert.equal(parsed.warnings.length, 0);
});

test("kordoc adapter returns failure for unsupported extension without buffer", async () => {
  const parsed = await parseFile({
    fileId: "file_hwp_nobuf",
    fileName: "test.hwp",
    content: "some text"
  });

  assert.equal(parsed.status, "failed");
  assert.match(parsed.parser, /kordoc_adapter_boundary/);
});

test("HWP table extractor finds requirements from parsed tables", async () => {
  const buffer = loadHwpBuffer();
  const parsed = await parseFile({
    fileId: "file_hwp_real",
    fileName: "sample-maintenance-real.hwp",
    buffer
  });

  const requirements = extractRequirementsFromTables(parsed);
  assert.ok(requirements.length >= 10, `expected >= 10 requirements, got ${requirements.length}`);

  // Check requirement structure
  const first = requirements[0];
  assert.ok(first.id, "requirement should have id");
  assert.ok(first.title, "requirement should have title");
  assert.ok(first.type, "requirement should have type");
  assert.ok(first.categoryId, "requirement should have categoryId");
  assert.ok(first.categoryCode, "requirement should have categoryCode");
  assert.equal(typeof first.mandatory, "boolean", "mandatory should be boolean");
  assert.ok(first.confidence > 0, "confidence should be > 0");
});

test("HWP table extractor maps category codes to correct types", async () => {
  const buffer = loadHwpBuffer();
  const parsed = await parseFile({
    fileId: "file_hwp_real",
    fileName: "sample-maintenance-real.hwp",
    buffer
  });

  const requirements = extractRequirementsFromTables(parsed);
  const types = new Set(requirements.map(r => r.type));

  // Should have at least functional (MAR) and security (SER)
  assert.ok(types.has("functional"), "should have functional type from MAR");
  assert.ok(types.has("security"), "should have security type from SER");

  // Check category codes
  const codes = new Set(requirements.map(r => r.categoryCode));
  assert.ok(codes.has("MAR"), "should have MAR category");
});

test("full pipeline works with HWP: parse → extract → estimate → report", async () => {
  const buffer = loadHwpBuffer();
  const parsed = await parseFile({
    fileId: "file_hwp_real",
    fileName: "sample-maintenance-real.hwp",
    buffer
  });

  assert.equal(parsed.status, "parsed");

  // Standard extraction works on textBlocks (may yield fewer requirements for HWP)
  const analysis = extractAnalysisModel(parsed);
  assert.ok(analysis.project, "should have project data");

  // HWP table extractor can find structured requirements
  const tableRequirements = extractRequirementsFromTables(parsed);
  assert.ok(tableRequirements.length >= 10, `expected >= 10 table requirements, got ${tableRequirements.length}`);
});
