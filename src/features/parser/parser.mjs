import { extname } from "node:path";
import { parseWithKordoc, isKordocExtension } from "./kordocAdapter.mjs";

const MARKDOWN_EXTENSIONS = [".md", ".txt"];
const KORDOC_EXTENSIONS = [".hwp", ".hwpx", ".docx", ".pdf", ".xlsx"];
const SUPPORTED_EXTENSIONS = [...MARKDOWN_EXTENSIONS, ...KORDOC_EXTENSIONS];

export { KORDOC_EXTENSIONS };

export function parserSupportedExtensions() {
  return [...SUPPORTED_EXTENSIONS];
}

/**
 * Parse a file by routing to the appropriate parser.
 * Now async to support kordoc binary document parsing.
 *
 * @param {{ fileId: string, fileName: string, content?: string, buffer?: ArrayBuffer|Buffer }} params
 * @returns {Promise<{ fileId, fileName, parser, status, textBlocks, tables, evidenceAnchors, confidence, warnings, rawText }>}
 */
export async function parseFile({ fileId, fileName, content, buffer }) {
  const extension = extname(fileName || "").toLowerCase();

  // Route kordoc-supported formats
  if (KORDOC_EXTENSIONS.includes(extension)) {
    if (buffer) {
      return parseWithKordoc({ fileId, fileName, buffer });
    }
    // No buffer provided — cannot parse binary format from text content
    return {
      ...failed(fileId, fileName, `Binary format ${extension} requires buffer input, not text content`),
      parser: "kordoc_adapter_boundary"
    };
  }

  // Unsupported extension
  if (!MARKDOWN_EXTENSIONS.includes(extension)) {
    return failed(fileId, fileName, `Unsupported parser extension: ${extension || "unknown"}`);
  }

  // Corrupt file detection
  if (String(content).includes("CORRUPT_RFP")) {
    return failed(fileId, fileName, "Controlled parser failure: corrupt fixture input");
  }

  // Markdown / text fixture parser (original logic, unchanged)
  const lines = String(content).replace(/\r\n/g, "\n").split("\n");
  const textBlocks = [];
  const evidenceAnchors = [];
  let currentSection = "문서 시작";

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    if (!trimmed) return;

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      currentSection = heading[2].trim();
      textBlocks.push({
        id: `block_${textBlocks.length + 1}`,
        type: "heading",
        section: currentSection,
        text: currentSection,
        lineStart: lineNumber,
        lineEnd: lineNumber
      });
      return;
    }

    const listItem = trimmed.match(/^\d+\.\s+(.+)$/);
    const text = listItem ? listItem[1].trim() : trimmed;
    const anchor = {
      id: `ev_${evidenceAnchors.length + 1}`,
      sourceFileId: fileId,
      sourceFileName: fileName,
      page: Math.max(1, Math.ceil(lineNumber / 40)),
      section: currentSection,
      lineStart: lineNumber,
      lineEnd: lineNumber,
      quote: text,
      parser: "markdown_fixture",
      confidence: listItem ? 0.88 : 0.82
    };
    evidenceAnchors.push(anchor);
    textBlocks.push({
      id: `block_${textBlocks.length + 1}`,
      type: listItem ? "list_item" : "paragraph",
      section: currentSection,
      text,
      evidenceRef: anchor.id,
      lineStart: lineNumber,
      lineEnd: lineNumber
    });
  });

  return {
    fileId,
    fileName,
    parser: "markdown_fixture",
    status: "parsed",
    textBlocks,
    tables: [],
    evidenceAnchors,
    confidence: confidenceAverage(evidenceAnchors),
    warnings: [],
    rawText: content
  };
}

function failed(fileId, fileName, message) {
  return {
    fileId,
    fileName,
    parser: "markdown_fixture",
    status: "failed",
    textBlocks: [],
    tables: [],
    evidenceAnchors: [],
    confidence: 0,
    warnings: [message],
    error: {
      code: "PARSER_CONTROLLED_FAILURE",
      message
    }
  };
}

function confidenceAverage(anchors) {
  if (!anchors.length) return 0;
  const total = anchors.reduce((sum, anchor) => sum + anchor.confidence, 0);
  return Math.round((total / anchors.length) * 100) / 100;
}
