#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

cleanup() {
  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

wait_for_http() {
  local url="$1"
  local label="$2"
  local attempt
  for attempt in $(seq 1 60); do
    if curl -sf "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "[v2-rc] ${label} failed to become ready: ${url}" >&2
  return 1
}

FRONTEND_TESTS=()
while IFS= read -r test_file; do
  FRONTEND_TESTS+=("$test_file")
done < <(find "$ROOT_DIR/frontend/src/v2" \( -name '*.test.ts' -o -name '*.test.tsx' \) | sort)
if [[ ${#FRONTEND_TESTS[@]} -eq 0 ]]; then
  echo '[v2-rc] no frontend V2 tests were found' >&2
  exit 1
fi

echo '[v2-rc] backend build'
npm --prefix "$ROOT_DIR/backend" run build:full

echo '[v2-rc] frontend build'
npm --prefix "$ROOT_DIR/frontend" run build

echo '[v2-rc] backend domain regressions'
npm --prefix "$ROOT_DIR/backend" test -- test/v2-domain-modules.test.ts

echo '[v2-rc] backend loop regressions'
npm --prefix "$ROOT_DIR/backend" test -- --runInBand test/v2-loop.test.ts

echo '[v2-rc] frontend V2 regressions'
CI=true npm --prefix "$ROOT_DIR/frontend" test -- --watchAll=false --runInBand "${FRONTEND_TESTS[@]}"

echo '[v2-rc] weekly benchmark'
npm --prefix "$ROOT_DIR/backend" run benchmark:v2:week

if [[ "${V2_RC_WITH_BROWSER:-false}" == 'true' ]]; then
  echo '[v2-rc] starting backend dev server'
  npm --prefix "$ROOT_DIR/backend" run dev > "$LOG_DIR/v2-rc-backend.log" 2>&1 &
  BACKEND_PID=$!

  echo '[v2-rc] starting frontend dev server'
  npm --prefix "$ROOT_DIR/frontend" run dev > "$LOG_DIR/v2-rc-frontend.log" 2>&1 &
  FRONTEND_PID=$!

  wait_for_http 'http://localhost:4000/api/v2/health' 'backend'
  wait_for_http 'http://localhost:3000/' 'frontend'

  echo '[v2-rc] browser smoke matrix'
  npm --prefix "$ROOT_DIR/backend" run test:v2:e2e:browser:all
else
  echo '[v2-rc] browser smoke skipped'
  echo '[v2-rc] rerun with V2_RC_WITH_BROWSER=true to include browser validation'
fi
