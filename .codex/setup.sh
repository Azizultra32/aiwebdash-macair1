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
    echo "Setting up git remote origin with default URL"
    git remote add origin https://github.com/Azizultra32/aiwebdash-macair1.git
    git fetch origin 'refs/pull/*/head:refs/pull/*' || true
  fi
  if command -v gh >/dev/null 2>&1; then
    gh pr list --state open --json number,title,headRefName > pr_list.json
  else
    echo "GitHub CLI not found. Attempting to install via apt-get..."
    if sudo apt-get update && sudo apt-get install -y gh; then
      gh pr list --state open --json number,title,headRefName > pr_list.json
    else
      echo "Tip: install the GitHub CLI (gh) to generate PR metadata for the dashboard" >&2
    fi
  fi
else
  echo "Error: npm not found." >&2
  exit 1
fi
