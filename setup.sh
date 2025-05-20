#!/usr/bin/env bash
set -euo pipefail

# Ensure Node.js dependencies are installed
if command -v npm >/dev/null 2>&1; then
    npm ci --include=dev
elif command -v yarn >/dev/null 2>&1; then
    yarn install --frozen-lockfile
else
    echo "Error: npm or yarn not found." >&2
    exit 1
fi
