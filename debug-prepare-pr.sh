#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Debug: prepare-pr.sh Environment Check"
echo "=========================================="

echo "📋 System Information:"
echo "- OS: $(uname -s)"
echo "- Node.js: $(node --version 2>/dev/null || echo 'Not found')"
echo "- npm: $(npm --version 2>/dev/null || echo 'Not found')"
echo "- Git: $(git --version 2>/dev/null || echo 'Not found')"

echo ""
echo "🔧 Git Configuration:"
echo "- User name: $(git config --global user.name 2>/dev/null || echo 'Not set')"
echo "- User email: $(git config --global user.email 2>/dev/null || echo 'Not set')"

echo ""
echo "📁 Repository Status:"
echo "- Current branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
echo "- Working tree clean: $(git diff --quiet && git diff --cached --quiet && echo 'Yes' || echo 'No')"
echo "- Origin remote: $(git remote | grep -q '^origin$' && echo 'Configured' || echo 'Missing')"

echo ""
echo "📦 Dependencies:"
echo "- node_modules exists: $([ -d node_modules ] && echo 'Yes' || echo 'No')"
echo "- package-lock.json exists: $([ -f package-lock.json ] && echo 'Yes' || echo 'No')"

echo ""
echo "🧪 Script Permissions:"
echo "- prepare-pr.sh executable: $([ -x prepare-pr.sh ] && echo 'Yes' || echo 'No')"
echo "- prepare-pr.sh exists: $([ -f prepare-pr.sh ] && echo 'Yes' || echo 'No')"

echo ""
echo "🔍 Environment Variables:"
echo "- GITHUB_TOKEN: $([ -n "${GITHUB_TOKEN:-}" ] && echo 'Set' || echo 'Not set')"
echo "- REPO_URL: $([ -n "${REPO_URL:-}" ] && echo 'Set' || echo 'Not set')"
echo "- CI: $([ -n "${CI:-}" ] && echo 'Set' || echo 'Not set')"

echo ""
echo "📄 prepare-pr.sh Content (first 10 lines):"
head -10 prepare-pr.sh 2>/dev/null || echo "Cannot read prepare-pr.sh"

echo ""
echo "🎯 Ready to run prepare-pr.sh? $([ -x prepare-pr.sh ] && [ -f prepare-pr.sh ] && echo 'Yes' || echo 'No')"
