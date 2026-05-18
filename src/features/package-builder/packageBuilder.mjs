import { deepClone, roundOne } from "../../lib/ids.mjs";

export function buildPackages(analysis) {
  const next = deepClone(analysis);
  const recommendedPackage = chooseRecommendedPackage(next);
  const packages = {
    S: buildPackage(next.requirements, "S"),
    M: buildPackage(next.requirements, "M"),
    L: buildPackage(next.requirements, "L")
  };

  next.packages = packages;
  next.packageSummary = {
    recommendedPackage,
    selectedPackage: recommendedPackage,
    selectedTotalMM: packages[recommendedPackage].totalMM,
    comparisonGeneratedAt: new Date().toISOString()
  };
  next.requirements = next.requirements.map((requirement) => ({
    ...requirement,
    included: packages[recommendedPackage].includedRequirementIds.includes(requirement.id)
  }));
  next.estimation = {
    ...next.estimation,
    totalMM: packages[recommendedPackage].totalMM,
    includedRequirementCount: packages[recommendedPackage].includedRequirementIds.length
  };
  next.status = "packaged";
  return next;
}

function chooseRecommendedPackage(analysis) {
  const title = `${analysis.project.title} ${analysis.project.projectType} ${analysis.project.businessDomain}`;
  const aiCount = analysis.requirements.filter((requirement) => /AI|모델|GPU|예측/.test(requirement.title)).length;
  if (/유지관리/.test(title)) return "S";
  if (analysis.project.budgetKRW >= 2000000000 || aiCount >= 4) return "L";
  return "M";
}

function buildPackage(requirements, key) {
  const included = requirements.filter((requirement) => includeRequirement(requirement, key));
  const totalMM = included.reduce((total, requirement) => ({
    min: roundOne(total.min + requirement.estimatedMM.min),
    recommended: roundOne(total.recommended + requirement.estimatedMM.recommended),
    max: roundOne(total.max + requirement.estimatedMM.max)
  }), { min: 0, recommended: 0, max: 0 });
  const proposalItemCount = included.filter((requirement) => requirement.type === "proposal_item").length;
  const infrastructureCount = included.filter((requirement) => requirement.type === "infrastructure").length;
  const highRiskCount = included.filter((requirement) => requirement.riskLevel === "high").length;
  const confidence = included.length
    ? Math.round((included.reduce((sum, requirement) => sum + requirement.confidence, 0) / included.length) * 100)
    : 0;

  return {
    key,
    name: key === "S" ? "Small" : key === "M" ? "Medium" : "Large",
    tagline: key === "S" ? "최소 범위" : key === "M" ? "균형 제안" : "전략 제안",
    includedRequirementIds: included.map((requirement) => requirement.id),
    excludedRequirementIds: requirements.filter((requirement) => !included.includes(requirement)).map((requirement) => requirement.id),
    totalMM,
    requirementCount: included.length,
    proposalItemCount,
    infrastructureCount,
    riskLevel: highRiskCount >= 3 ? "high" : highRiskCount > 0 ? "medium" : "low",
    confidence,
    recommendedStaffing: staffingFor(totalMM.recommended),
    recommendedScheduleMonths: Math.max(4, Math.ceil(totalMM.recommended / 6))
  };
}

function includeRequirement(requirement, key) {
  if (key === "L") return true;
  if (key === "S") return requirement.mandatory && requirement.type !== "proposal_item";
  if (requirement.mandatory) return true;
  return requirement.aiRecommendation === "recommend" && !/품질 검수|거버넌스/.test(requirement.title);
}

function staffingFor(recommendedMM) {
  const averageTeam = Math.max(3, Math.ceil(recommendedMM / 8));
  return `${averageTeam}명 핵심팀 + 보안/인프라 파트타임`;
}

