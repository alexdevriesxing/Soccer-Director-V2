#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[v2-baseline] backend build"
npm --prefix "$ROOT_DIR/backend" run build:full

echo "[v2-baseline] frontend build"
npm --prefix "$ROOT_DIR/frontend" run build

echo "[v2-baseline] backend V2 regression suite"
npm --prefix "$ROOT_DIR/backend" test -- --runInBand test/v2-loop.test.ts

echo "[v2-baseline] weekly benchmark"
npm --prefix "$ROOT_DIR/backend" run benchmark:v2:week

if [[ "${V2_BASELINE_WITH_BROWSER:-false}" == "true" ]]; then
  echo "[v2-baseline] browser smoke scenarios"
  npm --prefix "$ROOT_DIR/backend" run test:v2:e2e:browser:all
else
  echo "[v2-baseline] browser smoke skipped"
  echo "[v2-baseline] start frontend and backend dev servers, then rerun with V2_BASELINE_WITH_BROWSER=true"
fi
