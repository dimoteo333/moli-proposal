#!/usr/bin/env bash
set -euo pipefail
node --test tests/unit/pipeline.test.mjs --test-name-pattern "parser routes"
