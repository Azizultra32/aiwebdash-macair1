#!/usr/bin/env bash
set -euo pipefail

# Check that node_modules exists before running lint or test
if [ ! -d "node_modules" ]; then
  echo "Error: node_modules directory is missing. Run 'bash .codex/setup.sh' to install dependencies." >&2
  exit 1
fi

# Enforce Node.js 20.x minimum as specified in package.json engines
REQUIRED_NODE_MAJOR=20
CURRENT_NODE_MAJOR=$(node -v | sed -e 's/^v//' -e 's/\..*$//')
if [ "$CURRENT_NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
  echo "Error: Node ${REQUIRED_NODE_MAJOR}.x or higher required, but found $(node -v)." >&2
  exit 1
elif [ "$CURRENT_NODE_MAJOR" -ne "$REQUIRED_NODE_MAJOR" ]; then
  echo "Warning: Expected Node ${REQUIRED_NODE_MAJOR}.x, but found $(node -v). Continuing..." >&2
fi

# Optionally extend with more checks in the future
