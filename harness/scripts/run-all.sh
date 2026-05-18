#!/usr/bin/env bash
set -euo pipefail

bash harness/scripts/run-parser-harness.sh
bash harness/scripts/run-extraction-harness.sh
bash harness/scripts/run-estimation-harness.sh
bash harness/scripts/run-package-harness.sh
bash harness/scripts/run-report-harness.sh
bash harness/scripts/run-sharing-harness.sh
npm run test:unit
npm run test:integration
bash harness/scripts/run-ui-harness.sh
node harness/scripts/summarize-results.ts
