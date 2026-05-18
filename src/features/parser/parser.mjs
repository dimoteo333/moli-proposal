import { extname } from "node:path";

const SUPPORTED_EXTENSIONS = [".md", ".txt"];

export function parserSupportedExtensions() {
  return [...SUPPORTED_EXTENSIONS];
}

export function parseFile({ fileId, fileName, content }) {
  const extension = extname(fileName || "").toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return failed(fileId, fileName, `Unsupported parser extension: ${extension || "unknown"}`);
  }

  if (String(content).includes("CORRUPT_RFP")) {
    return failed(fileId, fileName, "Controlled parser failure: corrupt fixture input");
  }

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

