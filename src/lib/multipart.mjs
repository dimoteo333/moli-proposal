// Node 내장 API만 사용한 multipart/form-data 파서
// - Busboy/Multer 등 외부 패키지 없이 동작
// - 파일 업로드 + 일반 필드 지원
// - 메모리 버퍼에 저장 (MVP 범위)

export async function parseMultipart(request) {
  const contentType = request.headers['content-type'] || request.headers.get?.('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Expected multipart/form-data');
  }

  const boundary = contentType.split('boundary=')[1];
  if (!boundary) throw new Error('Missing boundary');

  // request body를 Buffer로 읽기
  const chunks = [];
  for await (const chunk of request) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  const raw = Buffer.concat(chunks);

  // boundary로 파트 분리
  const delimiter = Buffer.from(`--${boundary}`);
  const parts = splitParts(raw, delimiter);

  const fields = {};
  const files = [];

  for (const part of parts) {
    const headerEnd = findHeaderEnd(part);
    if (headerEnd === 0) continue; // 빈 파트 무시
    const headerStr = part.slice(0, headerEnd).toString('utf8');
    const body = part.slice(headerEnd + 4); // \r\n\r\n 건너뛰기

    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);

    if (!nameMatch) continue;
    const name = nameMatch[1];

    if (filenameMatch) {
      // 파일 파트
      const filename = filenameMatch[1];
      if (!filename) continue; // 빈 파일명 (브라우저가 빈 파일 필드를 보낸 경우)
      const contentTypeMatch = headerStr.match(/Content-Type:\s*(.+)/i);
      const mimeType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

      // 마지막 \r\n 제거
      const fileBuffer = stripTrailingCRLF(body);

      files.push({
        name,
        filename,
        mimeType,
        buffer: fileBuffer,
        size: fileBuffer.length
      });
    } else {
      // 일반 필드
      fields[name] = stripTrailingCRLF(body).toString('utf8');
    }
  }

  return { fields, files };
}

function splitParts(buffer, delimiter) {
  const parts = [];
  let start = 0;

  while (true) {
    const idx = buffer.indexOf(delimiter, start);
    if (idx === -1) break;

    if (start > 0) {
      // 이전 파트: start ~ idx 앞의 \r\n
      const partEnd = idx >= 2 ? idx - 2 : idx;
      if (partEnd > start) {
        parts.push(buffer.slice(start, partEnd));
      }
    }
    start = idx + delimiter.length + 2; // \r\n 건너뛰기
  }

  return parts;
}

function findHeaderEnd(buffer) {
  const sep = Buffer.from('\r\n\r\n');
  const idx = buffer.indexOf(sep);
  return idx === -1 ? 0 : idx;
}

function stripTrailingCRLF(buffer) {
  if (buffer.length >= 2 && buffer[buffer.length - 2] === 0x0D && buffer[buffer.length - 1] === 0x0A) {
    return buffer.slice(0, buffer.length - 2);
  }
  return buffer;
}
