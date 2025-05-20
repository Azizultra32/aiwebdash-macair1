#!/usr/bin/env bash
set -euo pipefail

# Ensure Node.js dependencies are installed
if command -v npm >/dev/null 2>&1; then
    npm ci --include=dev
else
    echo "Error: npm not found." >&2
    exit 1
fi
