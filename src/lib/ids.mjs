export function stableId(prefix, value) {
  const source = String(value || prefix);
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  return `${prefix}_${Math.abs(hash).toString(36)}`;
}

export function toNumber(value) {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function roundOne(value) {
  return Math.round((Number(value) + Number.EPSILON) * 10) / 10;
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function nowIso() {
  return new Date().toISOString();
}

