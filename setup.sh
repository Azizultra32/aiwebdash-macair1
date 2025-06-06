#!/usr/bin/env bash
set -euo pipefail

# Ensure Node.js dependencies are installed
if command -v npm >/dev/null 2>&1; then
    npm ci --include=dev

    # Add origin remote if it doesn't exist
    if ! git remote | grep -q 'origin'; then
        echo "Setting up git remote origin"
        git remote add origin https://github.com/Azizultra32/aiwebdash-macair1.git
    fi
    
    # Fetch PR branches for development
    git fetch origin 'refs/pull/*/head:refs/pull/*' || true
    
    # Save PR list if GitHub CLI is available
    if command -v gh >/dev/null 2>&1; then
        gh pr list --state open --json number,title,headRefName > pr_list.json || true
    fi
else
    echo "Error: npm not found." >&2
    exit 1
fi
