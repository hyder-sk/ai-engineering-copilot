#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

cp -n .env.example .env 2>/dev/null || true
npm install

echo "Bootstrap complete. Fill in .env and start Phase 1 in packages/agent."
