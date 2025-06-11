#!/usr/bin/env bash
set -euo pipefail

echo "🧪 Testing CI Environment Simulation"
echo "===================================="

# Clear existing Git configuration to simulate CI environment
echo "🔄 Clearing existing Git configuration..."
git config --global --unset user.name 2>/dev/null || true
git config --global --unset user.email 2>/dev/null || true
git config --unset user.name 2>/dev/null || true
git config --unset user.email 2>/dev/null || true

# Clear environment variables
unset GIT_AUTHOR_NAME 2>/dev/null || true
unset GIT_AUTHOR_EMAIL 2>/dev/null || true
unset GIT_COMMITTER_NAME 2>/dev/null || true
unset GIT_COMMITTER_EMAIL 2>/dev/null || true

echo "✅ Git configuration cleared"

# Show current state (should be empty)
echo ""
echo "📋 Current Git configuration (should be empty):"
echo "  Local - user.name: $(git config user.name 2>/dev/null || echo 'Not set')"
echo "  Local - user.email: $(git config user.email 2>/dev/null || echo 'Not set')"
echo "  Global - user.name: $(git config --global user.name 2>/dev/null || echo 'Not set')"
echo "  Global - user.email: $(git config --global user.email 2>/dev/null || echo 'Not set')"

# Set environment variables like GitHub Actions would
echo ""
echo "🔧 Setting GitHub Actions environment variables..."
export GIT_AUTHOR_NAME="GitHub Actions"
export GIT_AUTHOR_EMAIL="actions@github.com"
export GIT_COMMITTER_NAME="GitHub Actions"
export GIT_COMMITTER_EMAIL="actions@github.com"

echo "✅ Environment variables set:"
echo "  GIT_AUTHOR_NAME=$GIT_AUTHOR_NAME"
echo "  GIT_AUTHOR_EMAIL=$GIT_AUTHOR_EMAIL"
echo "  GIT_COMMITTER_NAME=$GIT_COMMITTER_NAME"
echo "  GIT_COMMITTER_EMAIL=$GIT_COMMITTER_EMAIL"

# Test the prepare-pr.sh script
echo ""
echo "🚀 Testing prepare-pr.sh script..."
echo "=================================="

# Run the script (should work with environment variables)
if ./prepare-pr.sh main; then
  echo ""
  echo "🎉 SUCCESS: prepare-pr.sh works in CI environment!"
else
  echo ""
  echo "❌ FAILED: prepare-pr.sh failed in CI environment"
  exit 1
fi

# Restore original Git configuration
echo ""
echo "🔄 Restoring original Git configuration..."
git config --global user.name "GitHub Actions"
git config --global user.email "actions@github.com"
echo "✅ Git configuration restored"

echo ""
echo "🎯 CI Environment Test Complete!"
echo "The prepare-pr.sh script is ready for GitHub Actions!"
