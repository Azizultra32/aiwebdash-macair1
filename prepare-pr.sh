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

# Configure Git user for CI environments
echo "🔧 Configuring Git identity..."

# Set environment variables if not already set (for CI environments)
if [ -z "${GIT_AUTHOR_NAME:-}" ]; then
  export GIT_AUTHOR_NAME="GitHub Actions"
  export GIT_AUTHOR_EMAIL="actions@github.com"
  export GIT_COMMITTER_NAME="GitHub Actions"
  export GIT_COMMITTER_EMAIL="actions@github.com"
  echo "✅ Git environment variables set"
fi

# Configure Git user if not already set
if [ -z "$(git config user.name 2>/dev/null || true)" ]; then
  echo "Configuring local Git user..."
  git config user.name "${GIT_AUTHOR_NAME:-GitHub Actions}"
  git config user.email "${GIT_AUTHOR_EMAIL:-actions@github.com}"
  echo "✅ Local Git user configured"
fi

# Also set global config as fallback
if [ -z "$(git config --global user.name 2>/dev/null || true)" ]; then
  echo "Configuring global Git user..."
  git config --global user.name "${GIT_AUTHOR_NAME:-GitHub Actions}"
  git config --global user.email "${GIT_AUTHOR_EMAIL:-actions@github.com}"
  echo "✅ Global Git user configured"
fi

# Display current configuration
echo "📋 Current Git configuration:"
echo "  Environment - GIT_AUTHOR_NAME: ${GIT_AUTHOR_NAME:-Not set}"
echo "  Environment - GIT_AUTHOR_EMAIL: ${GIT_AUTHOR_EMAIL:-Not set}"
echo "  Environment - GIT_COMMITTER_NAME: ${GIT_COMMITTER_NAME:-Not set}"
echo "  Environment - GIT_COMMITTER_EMAIL: ${GIT_COMMITTER_EMAIL:-Not set}"
echo "  Local - user.name: $(git config user.name 2>/dev/null || echo 'Not set')"
echo "  Local - user.email: $(git config user.email 2>/dev/null || echo 'Not set')"
echo "  Global - user.name: $(git config --global user.name 2>/dev/null || echo 'Not set')"
echo "  Global - user.email: $(git config --global user.email 2>/dev/null || echo 'Not set')"

# Validate Git configuration
if [ -z "${GIT_AUTHOR_NAME:-}" ] && [ -z "$(git config user.name 2>/dev/null)" ] && [ -z "$(git config --global user.name 2>/dev/null)" ]; then
  echo "❌ Error: Git user name must be configured"
  echo "Please set one of:"
  echo "  export GIT_AUTHOR_NAME='Your Name'"
  echo "  git config user.name 'Your Name'"
  echo "  git config --global user.name 'Your Name'"
  exit 1
fi

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
