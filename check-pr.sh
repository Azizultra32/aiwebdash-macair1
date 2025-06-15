#!/usr/bin/env bash
set -euo pipefail

# Usage: ./check-pr.sh <pr-number>
if [ $# -eq 0 ]; then
  echo "Usage: $0 <pr-number>"
  echo "Example: $0 251"
  exit 1
fi

# Ensure jq is installed before proceeding
if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required but not installed." >&2
  exit 1
fi

PR_NUMBER="$1"

echo "🔍 Checking PR #$PR_NUMBER"
echo "========================="

# Get PR info from pr_list.json
if [ ! -f "pr_list.json" ]; then
  echo "❌ Error: pr_list.json not found"
  exit 1
fi

PR_INFO=$(jq ".[] | select(.number == $PR_NUMBER)" pr_list.json)
if [ "$PR_INFO" = "null" ] || [ -z "$PR_INFO" ]; then
  echo "❌ Error: PR #$PR_NUMBER not found in pr_list.json"
  exit 1
fi

PR_TITLE=$(echo "$PR_INFO" | jq -r '.title')
PR_BRANCH=$(echo "$PR_INFO" | jq -r '.branch')
PR_AUTHOR=$(echo "$PR_INFO" | jq -r '.author')

echo "📋 PR Details:"
echo "  Title: $PR_TITLE"
echo "  Branch: $PR_BRANCH"
echo "  Author: $PR_AUTHOR"
echo ""

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "💾 Current branch: $CURRENT_BRANCH"

# Ensure working tree is clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Error: Working tree is not clean. Please commit or stash changes first."
  exit 1
fi

echo "🔄 Fetching PR branch..."
if ! git fetch origin "pull/$PR_NUMBER/head:pr-$PR_NUMBER" 2>/dev/null; then
  echo "⚠️  Fetch failed, trying alternative method..."
  if ! git fetch origin "$PR_BRANCH:pr-$PR_NUMBER" 2>/dev/null; then
    echo "❌ Error: Could not fetch PR branch"
    exit 1
  fi
fi

echo "🔀 Checking out PR branch..."
if ! git checkout "pr-$PR_NUMBER"; then
  echo "❌ Error: Could not checkout PR branch"
  exit 1
fi

echo "🧪 Testing PR..."
echo "==============="

# Run prepare-pr script to test the PR
if ./prepare-pr.sh main; then
  echo ""
  echo "✅ PR #$PR_NUMBER PASSED all tests!"
  echo "🎯 This PR is ready for merge"
  PR_STATUS="READY"
else
  echo ""
  echo "❌ PR #$PR_NUMBER FAILED tests"
  echo "🔧 This PR needs fixes before merge"
  PR_STATUS="FAILED"
fi

echo ""
echo "🔄 Returning to original branch..."
git checkout "$CURRENT_BRANCH"

# Clean up PR branch
echo "🧹 Cleaning up..."
git branch -D "pr-$PR_NUMBER" 2>/dev/null || true

echo ""
echo "📊 Final Result:"
echo "================"
echo "PR #$PR_NUMBER: $PR_STATUS"

if [ "$PR_STATUS" = "READY" ]; then
  echo ""
  echo "🚀 To merge this PR:"
  echo "1. Go to: https://github.com/Azizultra32/aiwebdash-macair1/pull/$PR_NUMBER"
  echo "2. Click 'Merge pull request'"
  echo "3. Choose merge method (squash recommended)"
  echo "4. Confirm merge"
fi
