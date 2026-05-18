import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { parseFile } from "../features/parser/parser.mjs";
import { extractAnalysisModel } from "../features/extraction/extraction.mjs";
import { estimateAnalysis, applyRequirementOverride } from "../features/estimation/estimation.mjs";
import { buildPackages } from "../features/package-builder/packageBuilder.mjs";
import { generateKoreanReport } from "../features/report/reportGenerator.mjs";
import { createShareLink, recalculateSharedAnalysis } from "../features/sharing/sharing.mjs";
import { stableId } from "../lib/ids.mjs";

const rootDir = fileURLToPath(new URL("../..", import.meta.url));
const appDir = join(rootDir, "src/app");
const publicDir = join(rootDir, "public");
const fixtureDir = join(rootDir, "harness/fixtures/rfp");
const procurementFixture = join(rootDir, "harness/fixtures/procurement/sample-procurement-notice.json");
const historicalFixture = join(rootDir, "harness/fixtures/historical/sample-internal-projects.json");

export async function createServer({ port = 3000, allowInProcessFallback = true } = {}) {
  const analyses = new Map();
  const shares = new Map();
  const store = { analyses, shares };

  const httpServer = createHttpServer(async (request, response) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);
      if (url.pathname.startsWith("/api/")) {
        const payload = await dispatchApi(request.method, url.pathname, await readBody(request), store);
        return sendJson(response, 200, payload);
      }
      return await serveStatic(url.pathname, response);
    } catch (error) {
      return sendJson(response, error.statusCode || 500, {
        error: error.message,
        code: error.code || "SERVER_ERROR"
      });
    }
  });

  try {
    await new Promise((resolve, reject) => {
      httpServer.once("error", reject);
      httpServer.listen(port, "127.0.0.1", resolve);
    });
  } catch (error) {
    if (error.code !== "EPERM" || !allowInProcessFallback) throw error;
    return {
      url: "http://moli.local",
      fetch: (path, options = {}) => inProcessFetch(path, options, store),
      close: async () => {}
    };
  }

  const address = httpServer.address();
  return {
    url: `http://127.0.0.1:${address.port}`,
    fetch: (path, options = {}) => fetch(`http://127.0.0.1:${address.port}${path}`, options),
    close: () => new Promise((resolve, reject) => {
      httpServer.close((error) => error ? reject(error) : resolve());
    })
  };
}

async function dispatchApi(method, path, body, store) {
  if (method === "POST" && path === "/api/analysis") {
    const id = stableId("analysis", `${body.sourceUrl}-${body.analysisMode}-${Date.now()}`);
    const analysis = {
      id,
      status: "draft",
      sourceUrl: body.sourceUrl || "",
      analysisMode: body.analysisMode || "standard",
      projectCategory: body.projectCategory || "공공 SI",
      files: [],
      versions: []
    };
    store.analyses.set(id, analysis);
    return { analysisId: id, status: "draft" };
  }

  const fileMatch = path.match(/^\/api\/analysis\/([^/]+)\/files$/);
  if (method === "POST" && fileMatch) {
    const analysis = requireAnalysis(store, fileMatch[1]);
    const fixture = body.fixture || "sample-public-si-rfp.md";
    const content = await readFile(join(fixtureDir, fixture), "utf8");
    analysis.files = [{
      id: stableId("file", fixture),
      name: fixture,
      fixture,
      content,
      status: "uploaded"
    }];
    analysis.status = "uploaded";
    return { analysisId: analysis.id, files: analysis.files.map(({ content: _content, ...file }) => file) };
  }

  const parseMatch = path.match(/^\/api\/analysis\/([^/]+)\/parse$/);
  if (method === "POST" && parseMatch) {
    const analysis = requireAnalysis(store, parseMatch[1]);
    const parsedFiles = analysis.files.map((file) => parseFile({
      fileId: file.id,
      fileName: file.name,
      content: file.content
    }));
    analysis.parsedFiles = parsedFiles;
    analysis.status = parsedFiles.some((file) => file.status === "parsed") ? "parsed" : "parse_failed";
    return { analysisId: analysis.id, status: analysis.status, parsedFiles: parsedFiles.length };
  }

  const extractMatch = path.match(/^\/api\/analysis\/([^/]+)\/extract$/);
  if (method === "POST" && extractMatch) {
    const analysis = requireAnalysis(store, extractMatch[1]);
    const parsed = analysis.parsedFiles?.find((file) => file.status === "parsed");
    if (!parsed) throw badRequest("No parsed file is available for extraction");
    const extracted = extractAnalysisModel(parsed);
    Object.assign(analysis, extracted, {
      id: analysis.id,
      sourceUrl: analysis.sourceUrl,
      analysisMode: analysis.analysisMode,
      projectCategory: analysis.projectCategory
    });
    return { analysisId: analysis.id, requirementCount: analysis.requirements.length, project: analysis.project };
  }

  const estimateMatch = path.match(/^\/api\/analysis\/([^/]+)\/estimate$/);
  if (method === "POST" && estimateMatch) {
    const analysis = requireAnalysis(store, estimateMatch[1]);
    const procurementNotice = JSON.parse(await readFile(procurementFixture, "utf8"));
    const historicalProjects = JSON.parse(await readFile(historicalFixture, "utf8"));
    const estimated = buildPackages(estimateAnalysis(analysis, { procurementNotice, historicalProjects }));
    store.analyses.set(analysis.id, estimated);
    const optional = estimated.requirements.find((requirement) => !requirement.mandatory && requirement.included);
    return {
      analysisId: estimated.id,
      totalMM: estimated.estimation.totalMM,
      recommendedPackage: estimated.packageSummary.recommendedPackage,
      optionalRequirementId: optional?.id
    };
  }

  const patchRequirement = path.match(/^\/api\/analysis\/([^/]+)\/requirements\/([^/]+)$/);
  if (method === "PATCH" && patchRequirement) {
    const analysis = requireAnalysis(store, patchRequirement[1]);
    const changed = buildPackages(applyRequirementOverride(analysis, patchRequirement[2], body));
    store.analyses.set(analysis.id, changed);
    return { analysisId: changed.id, totalMM: changed.estimation.totalMM };
  }

  const reportMatch = path.match(/^\/api\/analysis\/([^/]+)\/report$/);
  if (method === "POST" && reportMatch) {
    const analysis = requireAnalysis(store, reportMatch[1]);
    const packaged = analysis.packageSummary ? analysis : buildPackages(analysis);
    const report = generateKoreanReport(packaged);
    packaged.report = report;
    packaged.status = "report_generated";
    store.analyses.set(packaged.id, packaged);
    return report;
  }

  const shareMatch = path.match(/^\/api\/analysis\/([^/]+)\/share$/);
  if (method === "POST" && shareMatch) {
    const analysis = requireAnalysis(store, shareMatch[1]);
    const share = createShareLink(analysis, body);
    store.shares.set(share.shareId, share);
    return share;
  }

  const recalcMatch = path.match(/^\/api\/shared\/([^/]+)\/recalculate$/);
  if (method === "POST" && recalcMatch) {
    const share = store.shares.get(recalcMatch[1]);
    if (!share) throw notFound("Share link not found");
    const original = requireAnalysis(store, share.analysisId);
    const derived = recalculateSharedAnalysis(original, share, body);
    store.analyses.set(derived.id, derived);
    return { analysisId: derived.id, parentAnalysisId: derived.parentAnalysisId, totalMM: derived.estimation.totalMM };
  }

  const getAnalysis = path.match(/^\/api\/analysis\/([^/]+)$/);
  if (method === "GET" && getAnalysis) {
    return requireAnalysis(store, getAnalysis[1]);
  }

  throw notFound(`Unknown API route: ${method} ${path}`);
}

async function serveStatic(pathname, response) {
  const asset = await readStaticAsset(pathname);
  response.writeHead(200, { "content-type": asset.contentType });
  response.end(asset.body);
}

async function readStaticAsset(pathname) {
  const target = pathname === "/" ? "/index.html" : pathname;
  const baseDir = target === "/logo.ico" ? publicDir : appDir;
  const filePath = normalize(join(baseDir, target));
  if (!filePath.startsWith(baseDir)) throw notFound("Invalid static path");

  const body = await readFile(filePath);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml"
  };
  return {
    body,
    contentType: types[extname(filePath)] || "application/octet-stream"
  };
}

async function inProcessFetch(path, options, store) {
  const url = new URL(path, "http://moli.local");
  try {
    if (url.pathname.startsWith("/api/")) {
      const body = options.body ? JSON.parse(options.body) : {};
      const payload = await dispatchApi(options.method || "GET", url.pathname, body, store);
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    }

    const asset = await readStaticAsset(url.pathname);
    return new Response(asset.body, {
      status: 200,
      headers: { "content-type": asset.contentType }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, code: error.code || "SERVER_ERROR" }), {
      status: error.statusCode || 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
}

async function readBody(request) {
  if (request.method === "GET") return {};
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function requireAnalysis(store, id) {
  const analysis = store.analyses.get(id);
  if (!analysis) throw notFound(`Analysis not found: ${id}`);
  return analysis;
}

function notFound(message) {
  const error = new Error(message);
  error.statusCode = 404;
  error.code = "NOT_FOUND";
  return error;
}

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = "BAD_REQUEST";
  return error;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 3000);
  createServer({ port, allowInProcessFallback: false }).then((server) => {
    console.log(`MOLI service listening at ${server.url}`);
  }).catch((error) => {
    console.error(`MOLI service failed to start: ${error.message}`);
    process.exit(1);
  });
}
