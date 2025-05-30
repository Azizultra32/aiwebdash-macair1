#!/usr/bin/env bash
set -euo pipefail

# Install Node.js dependencies while network access is available
if command -v npm >/dev/null 2>&1; then
  # Use npm install to avoid ci failing if the lockfile is inconsistent.
  npm install --legacy-peer-deps

  # Lint and test steps may fail if the project has issues. Run them but
  # allow the script to continue so dependency installation succeeds.
  npm run lint || echo "Linting failed during setup"
  npm run test || echo "Tests failed during setup"
  # Fetch open pull requests if an origin remote is available. This step
  # shouldn't stop the rest of the setup if it fails.
  if git remote get-url origin >/dev/null 2>&1; then
    git fetch origin 'refs/pull/*/head:refs/pull/*' || true
  elif [ -n "${REPO_URL:-}" ]; then
    git remote add origin "$REPO_URL"
    git fetch origin 'refs/pull/*/head:refs/pull/*' || true
  else
    echo "Warning: no 'origin' remote found and REPO_URL is unset; skipping fetch"
  fi
  if command -v gh >/dev/null 2>&1; then
    gh pr list --state open --json number,title,headRefName > pr_list.json
  fi
else
  echo "Error: npm not found." >&2
  exit 1
fi
