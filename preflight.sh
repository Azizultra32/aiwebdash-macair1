#!/usr/bin/env bash
set -euo pipefail

# Check that node_modules exists before running lint or test
if [ ! -d "node_modules" ]; then
  echo "Error: node_modules directory is missing. Run 'bash .codex/setup.sh' to install dependencies." >&2
  exit 1
fi

# Optionally extend with more checks in the future
