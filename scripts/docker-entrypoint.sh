#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/app"
DB_LINK_PATH="$ROOT_DIR/backend/prisma/dev.db"
PERSIST_DIR="${PERSIST_DIR:-/persist}"
DB_TARGET_PATH="$PERSIST_DIR/dev.db"

mkdir -p "$PERSIST_DIR"

if [[ ! -L "$DB_LINK_PATH" ]]; then
  rm -f "$DB_LINK_PATH"
  ln -s "$DB_TARGET_PATH" "$DB_LINK_PATH"
fi

if [[ ! -s "$DB_TARGET_PATH" ]]; then
  echo "[entrypoint] initializing sqlite database at $DB_TARGET_PATH"
  npx --prefix "$ROOT_DIR/backend" prisma db push --schema "$ROOT_DIR/backend/prisma/schema.prisma"
  npm --prefix "$ROOT_DIR/backend" run seed
else
  echo "[entrypoint] using existing sqlite database at $DB_TARGET_PATH"
fi

exec node "$ROOT_DIR/backend/dist/server.js"
