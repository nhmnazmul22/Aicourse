#!/usr/bin/env bash
set -euo pipefail

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

docker compose up -d

echo "Backend starting on http://localhost:${PORT:-3001}"
