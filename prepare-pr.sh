#!/usr/bin/env bash
set -euo pipefail

# Usage: ./prepare-pr.sh [target-branch]
# Default target branch is 'main'.

TARGET_BRANCH="${1:-main}"

# Ensure origin remote exists
if ! git remote | grep -q '^origin$'; then
  echo "Error: 'origin' remote not found." >&2
  exit 1
fi

# Fetch and rebase onto target branch
if ! git fetch origin "$TARGET_BRANCH"; then
  echo "Error: failed to fetch from origin." >&2
  exit 1
fi

if ! git rebase "origin/$TARGET_BRANCH"; then
  echo "Error: git rebase failed." >&2
  exit 1
fi

# Run project checks
npm run preflight
npm run lint
npm run test

