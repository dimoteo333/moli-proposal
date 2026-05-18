import { applyRequirementOverride } from "../estimation/estimation.mjs";
import { buildPackages } from "../package-builder/packageBuilder.mjs";
import { generateKoreanReport } from "../report/reportGenerator.mjs";
import { deepClone, nowIso, stableId } from "../../lib/ids.mjs";

export function createShareLink(analysis, options) {
  const permission = options.permission || "view_only";
  const expiresInDays = Number.isFinite(options.expiresInDays) ? options.expiresInDays : 7;
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const shareId = stableId("share", `${analysis.id}-${permission}-${expiresAt}`);

  return {
    id: shareId,
    shareId,
    analysisId: analysis.id,
    permission,
    expiresAt,
    url: `/shared/${shareId}`,
    auditEvent: {
      event: "share_link_created",
      createdAt: nowIso(),
      permission,
      expiresAt
    }
  };
}

export function recalculateSharedAnalysis(originalAnalysis, share, change) {
  if (share.permission !== "editable_recalculation" && share.permission !== "internal_reviewer") {
    throw new Error("Share link does not allow recalculation");
  }

  const base = deepClone(originalAnalysis);
  const changed = applyRequirementOverride(base, change.requirementId, {
    included: change.included,
    reason: "공유 링크 재산정"
  });
  const packaged = buildPackages(changed);
  const report = generateKoreanReport(packaged);
  const derivedId = stableId("analysis", `${originalAnalysis.id}-${share.shareId}-${change.requirementId}-${change.included}`);

  return {
    ...packaged,
    id: derivedId,
    parentAnalysisId: originalAnalysis.id,
    status: "shared_derived",
    report,
    versions: [
      ...(packaged.versions || []),
      {
        id: stableId("version", `${derivedId}-shared-recalculation`),
        event: "shared_recalculation",
        createdAt: nowIso(),
        requirementId: change.requirementId,
        note: "Shared reviewer recalculation created a derived analysis version"
      }
    ]
  };
}

