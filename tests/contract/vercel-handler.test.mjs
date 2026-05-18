import assert from "node:assert/strict";
import test from "node:test";

import handler from "../../api/[...path].mjs";

test("Vercel function entrypoint dispatches API routes", async () => {
  const response = createMockResponse();

  await handler({ method: "GET", url: "/api/runtime/config" }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
  assert.equal(JSON.parse(response.body).vercel.env, "local");
});

function createMockResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body) {
      this.body = body;
    }
  };
}
