#!/usr/bin/env bash
set -euo pipefail

# Usage: ./prepare-pr.sh [main_branch]
# Default main branch is 'main'. This script helps prepare the current branch
# for a pull request by rebasing onto the latest main branch and running code
# quality checks.

MAIN_BRANCH="${1:-main}"

# Ensure an origin remote exists so we can fetch updates.
if ! git remote | grep -q "^origin$"; then
  echo "Error: no 'origin' remote found. Cannot fetch upstream changes." >&2
  exit 1
fi

# Fetch the latest commits from origin.
 git fetch origin "$MAIN_BRANCH"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$MAIN_BRANCH" ]; then
  # Rebase current branch onto the updated main branch.
  git rebase "origin/$MAIN_BRANCH"
fi

# Ensure dependencies are installed and run checks.
npm run preflight
npm run lint
npm run test

cat <<'MSG'
Preparation complete. Resolve any issues that arose during the rebase or tests
and push your branch to update the pull request.
MSG
