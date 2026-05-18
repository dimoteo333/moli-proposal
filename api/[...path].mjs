import { createMemoryStore, dispatchApi } from "../src/server/server.mjs";
import { getRuntimeConfig } from "../src/lib/env.mjs";

const store = createMemoryStore(getRuntimeConfig(process.env));

export default async function handler(request, response) {
  try {
    const url = new URL(request.url, "https://moli.local");
    const path = url.pathname.startsWith("/api/") ? url.pathname : `/api${url.pathname}`;
    const payload = await dispatchApi(request.method, path, await readVercelBody(request), store);
    sendJson(response, 200, payload);
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: error.message,
      code: error.code || "SERVER_ERROR"
    });
  }
}

async function readVercelBody(request) {
  if (request.method === "GET") return {};
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) return request.body;
  if (typeof request.body === "string") return request.body ? JSON.parse(request.body) : {};

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}
