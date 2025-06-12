#!/usr/bin/env bash
set -euo pipefail

# Codex PR workflow script
# 1. Run initial setup to install dependencies while network access is available
# 2. Rebase your branch on the latest main branch and run quality checks
# 3. Optionally execute the Codex PR assistant for automated review

TARGET_BRANCH="${1:-main}"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies via .codex/setup.sh..."
  bash .codex/setup.sh
fi

# Rebase branch and run quality checks
npm run prepare-pr "$TARGET_BRANCH"

# Optional: run the PR assistant if API keys are configured
if [ -n "${OPENAI_API_KEY:-}" ] && [ -n "${GITHUB_PERSONAL_ACCESS_TOKEN:-${GITHUB_TOKEN:-}}" ]; then
  echo "Running Codex PR assistant..."
  if ! command -v python3 >/dev/null 2>&1; then
    echo "python3 is required to run the Codex PR assistant but was not found." >&2
    exit 1
  fi
  python3 odex_pr_assistant.py
else
  echo "Skipping Codex PR assistant - API keys not configured"
fi

