/**
 * HWP Table-based Requirement Extractor
 *
 * Extracts structured requirements from kordoc-parsed HWP documents where
 * requirements are encoded as detailed tables with the pattern:
 *
 * Row 0: 요구사항 고유번호 | _ | MAR-001
 * Row 1: 분류 | _ | 유지관리 수행 요구사항
 * Row 2: 요구사항 명칭 | _ | ... | 응락수준 | 필수
 * Row 3: 요구사항 상세설명 | 정의 | ...
 * Row 4: (continued) | 세부 내용 | ...
 * Row 5: 산출물 | _ | ...
 */

import { stableId } from "../../lib/ids.mjs";

const CATEGORY_MAP = {
  MAR: { type: "functional", label: "유지관리 수행 요구사항" },
  MHR: { type: "infrastructure", label: "유지관리 인력 요구사항" },
  SER: { type: "security", label: "보안 요구사항" },
  QUR: { type: "non_functional", label: "품질 요구사항" },
  PMR: { type: "non_functional", label: "프로젝트 관리 요구사항" },
  PSR: { type: "documentation", label: "프로젝트 지원 요구사항" }
};

const REQ_ID_PATTERN = /\b([A-Z]{3})-(\d{3})\b/;

/**
 * Extract requirements from parsed HWP tables.
 * @param {{ tables: Array, textBlocks: Array, evidenceAnchors: Array, fileId: string, fileName: string }} parsed
 * @returns {Array<Requirement>}
 */
export function extractRequirementsFromTables(parsed) {
  const requirements = [];
  const { tables, evidenceAnchors } = parsed;

  for (const table of tables) {
    if (!table.rows || table.rows.length < 3) continue;

    // Detect requirement detail table pattern
    const reqInfo = parseRequirementTable(table);
    if (!reqInfo) continue;

    const category = CATEGORY_MAP[reqInfo.categoryCode];
    if (!category) continue;

    const confidence = calculateConfidence(reqInfo);
    const riskLevel = calculateRiskLevel(reqInfo, category.type);

    const requirement = {
      id: stableId("req", `${reqInfo.id}-${reqInfo.title}`),
      title: reqInfo.title,
      description: reqInfo.description,
      type: category.type,
      categoryCode: reqInfo.categoryCode,
      categoryId: reqInfo.id,
      categoryLabel: category.label,
      mandatory: reqInfo.mandatory,
      included: reqInfo.mandatory,
      aiRecommendation: reqInfo.mandatory ? "strong_recommend" : "optional",
      recommendationReason: reqInfo.mandatory
        ? "RFP 본문에 명시된 필수 과업으로 기본 제안 범위에 포함해야 합니다."
        : "선택 과업으로 검토 가능합니다.",
      estimatedMM: null,
      roleSplit: null,
      confidence,
      riskLevel,
      evidenceRefs: findEvidenceRefs(parsed, reqInfo),
      assumptions: [],
      deliverables: reqInfo.deliverables || [],
      sourceOrder: requirements.length + 1
    };

    requirements.push(requirement);
  }

  return requirements;
}

function parseRequirementTable(table) {
  // Look for the pattern: headers or first row contains "요구사항 고유번호"
  // and some row/cell contains a MAR-XXX / MHR-XXX etc. ID
  const headerText = (table.headers || []).join(" ");
  const firstRowTexts = table.rows[0] || [];
  const firstRowText = firstRowTexts.join(" ");

  if (!headerText.includes("요구사항 고유번호") && !firstRowText.includes("요구사항 고유번호")) return null;

  // Merge headers and all rows for searching
  const allRows = [table.headers || [], ...table.rows];

  // Find the requirement ID across all rows
  let reqId = null;
  let title = "";
  let description = "";
  let category = "";
  let mandatory = true;
  let deliverables = [];

  for (const row of allRows) {
    const joined = row.join(" ");

    // Extract requirement ID
    const idMatch = joined.match(REQ_ID_PATTERN);
    if (idMatch && !reqId) {
      reqId = idMatch[0];
    }

    // Extract category
    if (joined.includes("분류")) {
      const catText = row.filter(c => c && !c.includes("분류")).join(" ").trim();
      if (catText) category = catText;
    }

    // Extract title and mandatory level
    if (joined.includes("요구사항 명칭")) {
      for (const cell of row) {
        if (!cell || cell.includes("요구사항 명칭") || cell.includes("응락수준")) continue;
        if (cell === "필수" || cell === "권고") {
          mandatory = cell === "필수";
        } else if (cell.trim()) {
          title = cell.trim();
        }
      }
    }

    // Extract description
    if (joined.includes("상세설명") || joined.includes("정의") || joined.includes("세부")) {
      const descParts = row.filter(c => {
        if (!c) return false;
        const lower = c.trim();
        return lower &&
          !lower.includes("요구사항") &&
          !lower.includes("상세설명") &&
          !lower.includes("정의") &&
          !lower.includes("세부") &&
          !lower.includes("내용");
      });
      if (descParts.length > 0) {
        description += (description ? "\n" : "") + descParts.join(" ").trim();
      }
    }

    // Extract deliverables
    if (joined.includes("산출물")) {
      const delParts = row.filter(c => c && !c.includes("산출물")).filter(c => c.trim());
      deliverables = delParts.flatMap(d => d.split(",").map(s => s.trim())).filter(Boolean);
    }
  }

  if (!reqId || !title) return null;

  const categoryCode = reqId.split("-")[0];

  return {
    id: reqId,
    title,
    description: description || title,
    category,
    categoryCode,
    mandatory,
    deliverables
  };
}

function calculateConfidence(reqInfo) {
  // High confidence if we have all fields
  let conf = 0.85;
  if (!reqInfo.description || reqInfo.description === reqInfo.title) conf -= 0.08;
  if (!reqInfo.deliverables || reqInfo.deliverables.length === 0) conf -= 0.03;
  return Math.round(conf * 100) / 100;
}

function calculateRiskLevel(reqInfo, type) {
  if (/보안|암호화|침해|취약점|개인정보/.test(reqInfo.description)) return "high";
  if (type === "security" || type === "infrastructure") return "medium";
  return "low";
}

function findEvidenceRefs(parsed, reqInfo) {
  // Find evidence anchors that reference the requirement ID
  const refs = [];
  for (const anchor of parsed.evidenceAnchors) {
    if (anchor.quote && anchor.quote.includes(reqInfo.id)) {
      refs.push(anchor.id);
      continue;
    }
    if (anchor.quote && anchor.quote.includes(reqInfo.title)) {
      refs.push(anchor.id);
    }
  }
  return refs.slice(0, 5); // Cap at 5 refs
}
