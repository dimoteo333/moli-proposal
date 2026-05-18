import { stableId } from "../../lib/ids.mjs";

export function createHistoricalProjectRecord(input) {
  return {
    id: input.id || stableId("hist", `${input.projectName}-${input.businessDomain}`),
    projectName: input.projectName,
    clientType: input.clientType || "public",
    businessDomain: input.businessDomain,
    projectType: input.projectType,
    actualMM: input.actualMM,
    anonymized: input.anonymized !== false,
    excludedFromCalibration: Boolean(input.excludedFromCalibration),
    validated: Boolean(input.validated),
    qualityScore: input.validated ? 90 : 55
  };
}

export function activeRateTable() {
  return {
    version: "MOLI-2026.1",
    effectiveDate: "2026-05-18",
    guideName: "Deterministic fixture calibration",
    fpUnitPriceNote: "외부 확정 단가가 아닌 하네스 검증용 기준값",
    roleRateAssumptions: {
      pm: 1,
      architect: 1,
      backend: 1,
      frontend: 1,
      data: 1,
      infra: 1,
      security: 1,
      qa: 1
    },
    riskMultipliers: {
      low: 1,
      medium: 1.15,
      high: 1.3
    }
  };
}

