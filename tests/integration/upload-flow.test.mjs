import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createServer } from '../../src/server/server.mjs';

test('upload endpoint accepts HWP file via multipart/form-data', async (t) => {
  const server = await createServer({ port: 0 });
  t.after(async () => server.close());

  // 1. 분석 생성
  const created = await post(server, '/api/analysis', {
    sourceUrl: '', analysisMode: 'standard', projectCategory: '유지관리'
  });

  // 2. multipart 업로드
  const hwpBuffer = readFileSync('harness/fixtures/rfp/sample-maintenance-real.hwp');
  const boundary = '----TestBoundary12345';

  const headerBuf = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test-upload.hwp"\r\nContent-Type: application/octet-stream\r\n\r\n`
  );
  const footerBuf = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([headerBuf, hwpBuffer, footerBuf]);

  const response = await server.fetch(`/api/analysis/${created.analysisId}/upload`, {
    method: 'POST',
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    body: body
  });

  const result = await response.json();
  assert.equal(response.ok, true, JSON.stringify(result));
  assert.equal(result.files[0].name, 'test-upload.hwp');
  assert.ok(result.files[0].size > 0);
});

test('upload rejects unsupported file types', async (t) => {
  const server = await createServer({ port: 0 });
  t.after(async () => server.close());

  const created = await post(server, '/api/analysis', {});

  const boundary = '----RejectBoundary';
  const headerBuf = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="malware.exe"\r\nContent-Type: application/octet-stream\r\n\r\n`
  );
  const footerBuf = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([headerBuf, Buffer.from('fake exe content'), footerBuf]);

  const response = await server.fetch(`/api/analysis/${created.analysisId}/upload`, {
    method: 'POST',
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    body
  });

  assert.equal(response.ok, false);
  const result = await response.json();
  assert.match(result.error, /지원하지 않는 파일 형식/);
});

test('upload rejects empty files', async (t) => {
  const server = await createServer({ port: 0 });
  t.after(async () => server.close());

  const created = await post(server, '/api/analysis', {});

  const boundary = '----EmptyBoundary';
  const headerBuf = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="empty.pdf"\r\nContent-Type: application/pdf\r\n\r\n`
  );
  const footerBuf = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([headerBuf, footerBuf]);

  const response = await server.fetch(`/api/analysis/${created.analysisId}/upload`, {
    method: 'POST',
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    body
  });

  assert.equal(response.ok, false);
  const result = await response.json();
  assert.match(result.error, /빈 파일/);
});

test('full upload-to-report pipeline with HWP file', async (t) => {
  const server = await createServer({ port: 0 });
  t.after(async () => server.close());

  // Upload HWP file
  const created = await post(server, '/api/analysis', { analysisMode: 'standard' });
  const hwpBuffer = readFileSync('harness/fixtures/rfp/sample-maintenance-real.hwp');

  const boundary = '----PipelineBoundary';
  const headerBuf = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="pipeline-test.hwp"\r\nContent-Type: application/octet-stream\r\n\r\n`
  );
  const footerBuf = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([headerBuf, hwpBuffer, footerBuf]);

  const uploadRes = await server.fetch(`/api/analysis/${created.analysisId}/upload`, {
    method: 'POST',
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    body
  });
  assert.equal(uploadRes.ok, true);

  // Parse
  const parsed = await post(server, `/api/analysis/${created.analysisId}/parse`, {});
  assert.equal(parsed.status, 'parsed');

  // Extract
  const extracted = await post(server, `/api/analysis/${created.analysisId}/extract`, {});
  assert.ok(extracted.requirementCount >= 0);

  // Estimate
  const estimated = await post(server, `/api/analysis/${created.analysisId}/estimate`, {});
  assert.ok(typeof estimated.totalMM.recommended === 'number');

  // Report
  const report = await post(server, `/api/analysis/${created.analysisId}/report`, {});
  assert.match(report.markdown, /## 경영진 요약/);
});

test('fixture-based HWP upload works through files endpoint', async (t) => {
  const server = await createServer({ port: 0 });
  t.after(async () => server.close());

  const created = await post(server, '/api/analysis', {});

  // 기존 files 엔드포인트로 HWP fixture 업로드
  const uploaded = await post(server, `/api/analysis/${created.analysisId}/files`, {
    fixture: 'sample-maintenance-real.hwp'
  });
  assert.equal(uploaded.files.length, 1);
  assert.ok(uploaded.files[0].size > 0, 'HWP fixture should report size > 0');

  // 파싱
  const parsed = await post(server, `/api/analysis/${created.analysisId}/parse`, {});
  assert.equal(parsed.status, 'parsed');
});

test('multipart parser extracts form fields alongside files', async (t) => {
  const server = await createServer({ port: 0 });
  t.after(async () => server.close());

  const created = await post(server, '/api/analysis', {});

  const boundary = '----FieldsBoundary';
  const mdContent = '# 테스트 문서\n\n요구사항 1: 사용자 인증 기능\n요구사항 2: 데이터 백업';
  const bodyParts = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="sourceUrl"\r\n\r\n` +
    `https://example.com/rfp\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="test.md"\r\n` +
    `Content-Type: text/markdown\r\n\r\n` +
    `${mdContent}\r\n` +
    `--${boundary}--\r\n`
  );

  const uploadRes = await server.fetch(`/api/analysis/${created.analysisId}/upload`, {
    method: 'POST',
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    body: bodyParts
  });
  assert.equal(uploadRes.ok, true);
  const result = await uploadRes.json();
  assert.equal(result.files[0].name, 'test.md');

  // sourceUrl 필드가 분석에 반영되었는지 확인
  const analysis = await (await server.fetch(`/api/analysis/${created.analysisId}`)).json();
  assert.equal(analysis.sourceUrl, 'https://example.com/rfp');
});

test('upload with no file returns error', async (t) => {
  const server = await createServer({ port: 0 });
  t.after(async () => server.close());

  const created = await post(server, '/api/analysis', {});

  const boundary = '----NoFileBoundary';
  const bodyParts = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="sourceUrl"\r\n\r\n` +
    `https://example.com\r\n` +
    `--${boundary}--\r\n`
  );

  const response = await server.fetch(`/api/analysis/${created.analysisId}/upload`, {
    method: 'POST',
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    body: bodyParts
  });

  assert.equal(response.ok, false);
  const result = await response.json();
  assert.match(result.error, /No file uploaded/i);
});

async function post(server, path, body) {
  const response = await server.fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`POST ${path} failed: ${JSON.stringify(payload)}`);
  return payload;
}
