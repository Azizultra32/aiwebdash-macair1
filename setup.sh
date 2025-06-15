#!/usr/bin/env bash
set -euo pipefail

# Enhanced setup script that works for both local development and Codex environments
# This script installs dependencies, runs quality checks, and fetches PR data

echo "Starting project setup..."

# Install Node.js dependencies
if command -v npm >/dev/null 2>&1; then
  echo "Installing dependencies..."

  # Use npm install with legacy peer deps to handle dependency conflicts
  # This is more reliable than npm ci in environments where lockfile may be inconsistent
  npm install --legacy-peer-deps

  # Run quality checks - these may fail if the project has issues, but shouldn't block setup
  echo "Running linting checks..."
  npm run lint || echo "⚠️  Linting failed during setup (this is expected if there are existing issues)"

  echo "Running tests..."
  npm run test || echo "⚠️  Tests failed during setup (this is expected if there are existing issues)"

  # Set up git remote and fetch PR data
  echo "Setting up git remote and fetching PR data..."

  if git remote get-url origin >/dev/null 2>&1; then
    echo "Using existing origin remote"
    git fetch origin 'refs/pull/*/head:refs/pull/*' || true
  elif [ -n "${REPO_URL:-}" ]; then
    echo "Adding origin remote from REPO_URL: $REPO_URL"
    git remote add origin "$REPO_URL"
    git fetch origin 'refs/pull/*/head:refs/pull/*' || true
  else
    echo "Adding default origin remote"
    git remote add origin https://github.com/Azizultra32/aiwebdash-macair1.git
    git fetch origin 'refs/pull/*/head:refs/pull/*' || true
  fi

  # Generate PR list, attempting to install GitHub CLI if missing
  if command -v gh >/dev/null 2>&1; then
    echo "Generating PR list with GitHub CLI..."
    gh pr list --state open --json number,title,headRefName > pr_list.json || echo "Failed to generate PR list"
  else
    echo "GitHub CLI not available. Attempting to install via apt-get..."
    if sudo apt-get update && sudo apt-get install -y gh; then
      gh pr list --state open --json number,title,headRefName > pr_list.json || echo "Failed to generate PR list"
    else
      echo "Skipping PR list generation - failed to install GitHub CLI" >&2
    fi
  fi

  echo "✅ Setup completed successfully!"
  echo ""
  echo "Next steps:"
  echo "1. Run 'npm run dev' to start the development server"
  echo "2. Run 'npm run prepare-pr main' before creating pull requests"
else
  echo "❌ Error: npm not found. Please install Node.js." >&2
  exit 1
fi
