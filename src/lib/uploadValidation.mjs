const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const SUPPORTED_EXTENSIONS = ['.hwp', '.hwpx', '.docx', '.pdf', '.xlsx', '.md', '.txt'];

export function validateUpload({ filename, size, mimeType }) {
  const errors = [];

  if (!filename) {
    errors.push('파일명이 없습니다.');
    return { valid: false, errors };
  }

  const dotIdx = filename.lastIndexOf('.');
  if (dotIdx === -1) {
    errors.push(`지원하지 않는 파일 형식입니다. 지원 형식: ${SUPPORTED_EXTENSIONS.join(', ')}`);
    return { valid: false, errors };
  }

  const ext = filename.slice(dotIdx).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    errors.push(`지원하지 않는 파일 형식: ${ext}. 지원 형식: ${SUPPORTED_EXTENSIONS.join(', ')}`);
  }

  if (size > MAX_FILE_SIZE) {
    errors.push(`파일 크기가 너무 큽니다: ${(size / 1024 / 1024).toFixed(1)}MB (최대 100MB)`);
  }

  if (size === 0) {
    errors.push('빈 파일입니다.');
  }

  return { valid: errors.length === 0, errors };
}

export { MAX_FILE_SIZE, SUPPORTED_EXTENSIONS };
