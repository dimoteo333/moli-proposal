# QA Plan

## Test Layers

1. Unit tests
2. Contract tests
3. Integration tests
4. Harness fixture tests
5. Accessibility tests
6. E2E shell tests
7. Build and lint checks

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:a11y
npm run harness
npm run build
```

## Completion Rule

완료 선언 전 위 명령을 모두 실행하고 성공 결과를 확인합니다. 소켓 바인딩이 제한된 샌드박스에서는 서버가 in-process fetch fallback으로 통합 테스트를 수행합니다.
