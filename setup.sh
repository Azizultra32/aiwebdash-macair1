#!/usr/bin/env bash
set -euo pipefail

# Ensure Node.js dependencies are installed
if command -v npm >/dev/null 2>&1; then
    npm ci --include=dev

# Fetch all open pull request branches from GitHub before going offline
if git remote get-url origin >/dev/null 2>&1; then
    echo "Fetching all open PR branches from GitHub..."
    git fetch origin 'refs/pull/*/head:refs/pull/*'
    # Optionally, snapshot open PRs if GitHub CLI is available
    if command -v gh >/dev/null 2>&1; then
        echo "Saving open PR list to pr_list.json..."
        gh pr list --state open --json number,title,headRefName > pr_list.json || true
    fi
else
    echo "Warning: git remote 'origin' not set. Skipping PR fetch."
fi
else
    echo "Error: npm not found." >&2
    exit 1
fi
