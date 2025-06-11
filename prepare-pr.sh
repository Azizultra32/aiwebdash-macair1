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

# Validate Git identity
echo "🔧 Validating Git identity..."

# Check if Git user is configured
if [ -z "$(git config --global user.name 2>/dev/null || true)" ]; then
  echo "❌ Error: Git user name not configured globally"
  echo "This should have been set by the workflow. Please ensure the workflow includes:"
  echo "  git config --global user.name 'GitHub Actions Bot'"
  echo "  git config --global user.email 'github-actions[bot]@users.noreply.github.com'"
  exit 1
fi

if [ -z "$(git config --global user.email 2>/dev/null || true)" ]; then
  echo "❌ Error: Git user email not configured globally"
  echo "This should have been set by the workflow. Please ensure the workflow includes:"
  echo "  git config --global user.name 'GitHub Actions Bot'"
  echo "  git config --global user.email 'github-actions[bot]@users.noreply.github.com'"
  exit 1
fi

echo "✅ Git identity validated:"
echo "  Global user.name: $(git config --global user.name)"
echo "  Global user.email: $(git config --global user.email)"

# Ensure origin remote exists or configure it from REPO_URL
if ! git remote | grep -q '^origin$'; then
  if [ -n "${REPO_URL:-}" ]; then
    if ! git remote add origin "$REPO_URL"; then
      echo "Error: failed to add origin remote from REPO_URL." >&2
      exit 1
    fi
  else
    echo "Error: 'origin' remote not found and REPO_URL is unset." >&2
    exit 1
  fi
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
  echo "❌ Error: git rebase failed." >&2
  echo "This usually means there are merge conflicts that need manual resolution." >&2
  echo "To resolve conflicts:" >&2
  echo "  1. Fix conflicts in the affected files" >&2
  echo "  2. Run: git add <resolved-files>" >&2
  echo "  3. Run: git rebase --continue" >&2
  echo "  4. Re-run this script: ./prepare-pr.sh $TARGET_BRANCH" >&2
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
