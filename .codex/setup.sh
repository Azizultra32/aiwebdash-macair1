#!/usr/bin/env bash
set -euo pipefail

# Install Node.js dependencies while network access is available
if command -v npm >/dev/null 2>&1; then
  npm ci --include=dev
  npm run lint
  npm run test
else
  echo "Error: npm not found." >&2
  exit 1
fi
