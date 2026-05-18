import { parse as kordocParse, detectFormat } from 'kordoc';

const KORDOC_EXTENSIONS = ['.hwp', '.hwpx', '.docx', '.pdf', '.xlsx'];

export function isKordocExtension(ext) {
  return KORDOC_EXTENSIONS.includes(ext);
}

/**
 * Parse a binary document using kordoc and convert to the standard parseFile output format.
 * @param {{ fileId: string, fileName: string, buffer: ArrayBuffer|Buffer }} params
 * @returns {Promise<import('./parser.mjs').ParseResult>}
 */
export async function parseWithKordoc({ fileId, fileName, buffer }) {
  try {
    const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    const format = detectFormat(buf);

    if (format === 'unknown') {
      return failed(fileId, fileName, `kordoc could not detect format for: ${fileName}`);
    }

    const result = await kordocParse(buf);

    if (!result.success) {
      return failed(fileId, fileName, `kordoc parse failed for: ${fileName}`);
    }

    const blocks = result.blocks || [];
    const textBlocks = [];
    const evidenceAnchors = [];
    const tables = [];
    let currentSection = '문서 시작';

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      if (block.type === 'heading') {
        currentSection = block.text.trim();
        textBlocks.push({
          id: `block_${textBlocks.length + 1}`,
          type: 'heading',
          section: currentSection,
          text: currentSection,
          lineStart: i + 1,
          lineEnd: i + 1
        });
        const anchor = {
          id: `ev_${evidenceAnchors.length + 1}`,
          sourceFileId: fileId,
          sourceFileName: fileName,
          page: block.pageNumber || 1,
          section: currentSection,
          lineStart: i + 1,
          lineEnd: i + 1,
          quote: currentSection,
          parser: `kordoc_${format}`,
          confidence: 0.95
        };
        evidenceAnchors.push(anchor);
        continue;
      }

      if (block.type === 'table') {
        const tableData = extractTableData(block, i);
        tables.push(tableData.table);

        // Also create text blocks from table content for downstream extraction
        for (const rowText of tableData.rowTexts) {
          if (!rowText.trim()) continue;
          const anchor = {
            id: `ev_${evidenceAnchors.length + 1}`,
            sourceFileId: fileId,
            sourceFileName: fileName,
            page: block.pageNumber || 1,
            section: currentSection,
            lineStart: i + 1,
            lineEnd: i + 1,
            quote: rowText.trim(),
            parser: `kordoc_${format}`,
            confidence: 0.90
          };
          evidenceAnchors.push(anchor);
          textBlocks.push({
            id: `block_${textBlocks.length + 1}`,
            type: 'table_row',
            section: currentSection,
            text: rowText.trim(),
            evidenceRef: anchor.id,
            lineStart: i + 1,
            lineEnd: i + 1
          });
        }
        continue;
      }

      if (block.type === 'paragraph') {
        const text = (block.text || '').trim();
        if (!text) continue;

        // Check if paragraph contains list-like content (lines starting with ㅇ or -)
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length > 1 && lines.some(l => /^[ㅇ\-•]/.test(l.trim()))) {
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            const anchor = {
              id: `ev_${evidenceAnchors.length + 1}`,
              sourceFileId: fileId,
              sourceFileName: fileName,
              page: block.pageNumber || 1,
              section: currentSection,
              lineStart: i + 1,
              lineEnd: i + 1,
              quote: trimmedLine,
              parser: `kordoc_${format}`,
              confidence: 0.82
            };
            evidenceAnchors.push(anchor);
            textBlocks.push({
              id: `block_${textBlocks.length + 1}`,
              type: 'list_item',
              section: currentSection,
              text: trimmedLine,
              evidenceRef: anchor.id,
              lineStart: i + 1,
              lineEnd: i + 1
            });
          }
        } else {
          const anchor = {
            id: `ev_${evidenceAnchors.length + 1}`,
            sourceFileId: fileId,
            sourceFileName: fileName,
            page: block.pageNumber || 1,
            section: currentSection,
            lineStart: i + 1,
            lineEnd: i + 1,
            quote: text,
            parser: `kordoc_${format}`,
            confidence: 0.82
          };
          evidenceAnchors.push(anchor);
          textBlocks.push({
            id: `block_${textBlocks.length + 1}`,
            type: 'paragraph',
            section: currentSection,
            text,
            evidenceRef: anchor.id,
            lineStart: i + 1,
            lineEnd: i + 1
          });
        }
        continue;
      }

      if (block.type === 'list') {
        const text = (block.text || '').trim();
        if (!text) continue;
        const anchor = {
          id: `ev_${evidenceAnchors.length + 1}`,
          sourceFileId: fileId,
          sourceFileName: fileName,
          page: block.pageNumber || 1,
          section: currentSection,
          lineStart: i + 1,
          lineEnd: i + 1,
          quote: text,
          parser: `kordoc_${format}`,
          confidence: 0.85
        };
        evidenceAnchors.push(anchor);
        textBlocks.push({
          id: `block_${textBlocks.length + 1}`,
          type: 'list_item',
          section: currentSection,
          text,
          evidenceRef: anchor.id,
          lineStart: i + 1,
          lineEnd: i + 1
        });
      }
    }

    return {
      fileId,
      fileName,
      parser: `kordoc_${format}`,
      status: 'parsed',
      textBlocks,
      tables,
      evidenceAnchors,
      confidence: confidenceAverage(evidenceAnchors),
      warnings: [],
      rawText: result.markdown || ''
    };
  } catch (error) {
    return failed(fileId, fileName, `kordoc adapter error: ${error.message}`);
  }
}

function extractTableData(block, blockIndex) {
  const tbl = block.table;
  if (!tbl || !tbl.cells) {
    return {
      table: { index: blockIndex, rows: 0, cols: 0, headers: [], rows: [] },
      rowTexts: []
    };
  }

  const headers = [];
  const dataRows = [];
  const rowTexts = [];

  for (let rowIdx = 0; rowIdx < tbl.cells.length; rowIdx++) {
    const row = tbl.cells[rowIdx];
    const cellTexts = row.map(cell => cell.text.trim());
    rowTexts.push(cellTexts.join(' | '));

    if (rowIdx === 0) {
      headers.push(...cellTexts);
    } else {
      dataRows.push(cellTexts);
    }
  }

  return {
    table: {
      index: blockIndex,
      rows: tbl.rows,
      cols: tbl.cols,
      headers,
      rows: dataRows
    },
    rowTexts
  };
}

function failed(fileId, fileName, message) {
  return {
    fileId,
    fileName,
    parser: 'kordoc_adapter',
    status: 'failed',
    textBlocks: [],
    tables: [],
    evidenceAnchors: [],
    confidence: 0,
    warnings: [message],
    error: {
      code: 'PARSER_KORDOC_FAILURE',
      message
    }
  };
}

function confidenceAverage(anchors) {
  if (!anchors.length) return 0;
  const total = anchors.reduce((sum, anchor) => sum + anchor.confidence, 0);
  return Math.round((total / anchors.length) * 100) / 100;
}
