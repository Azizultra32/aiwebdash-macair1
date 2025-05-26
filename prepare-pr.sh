#!/usr/bin/env bash
set -euo pipefail

# Usage: ./prepare-pr.sh [target-branch]
# Default target branch is 'main'.

TARGET_BRANCH="${1:-main}"

# Ensure required tools are available
if ! command -v git >/dev/null 2>&1; then
  echo "Error: git not found." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm not found." >&2
  exit 1
fi

# Ensure origin remote exists
if ! git remote | grep -q '^origin$'; then
  echo "Error: 'origin' remote not found." >&2
  exit 1
fi

# Ensure working tree is clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: working tree is not clean. Commit or stash changes first." >&2
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
if ! npm run preflight; then
  echo "Error: preflight failed." >&2
  exit 1
fi

if ! npm run lint; then
  echo "Error: lint failed." >&2
  exit 1
fi

if ! npm run test; then
  echo "Error: tests failed." >&2
  exit 1
fi
