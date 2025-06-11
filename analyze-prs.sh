#!/usr/bin/env bash
set -euo pipefail

echo "🔍 PR Analysis Report"
echo "===================="
echo "Generated: $(date)"
echo ""

# Read PR list
if [ ! -f "pr_list.json" ]; then
  echo "❌ Error: pr_list.json not found"
  exit 1
fi

# Count PRs by type
total_prs=$(jq length pr_list.json)
codex_prs=$(jq '[.[] | select(.labels[] == "codex")] | length' pr_list.json)
dependabot_prs=$(jq '[.[] | select(.author == "dependabot[bot]")] | length' pr_list.json)
draft_prs=$(jq '[.[] | select(.status == "DRAFT")] | length' pr_list.json)

echo "📊 PR Summary:"
echo "  Total PRs: $total_prs"
echo "  Codex PRs: $codex_prs"
echo "  Dependabot PRs: $dependabot_prs"
echo "  Draft PRs: $draft_prs"
echo ""

echo "📋 PR Details:"
echo "=============="

# Analyze each PR
jq -r '.[] | "PR #\(.number): \(.title)
  Branch: \(.branch)
  Author: \(.author)
  Status: \(.status)
  Labels: \(.labels | join(", "))
  Created: \(.created)
  Mergeable: \(.mergeable)
"' pr_list.json

echo ""
echo "🎯 Recommendations:"
echo "=================="

# Provide recommendations
if [ $dependabot_prs -gt 0 ]; then
  echo "✅ Dependabot PRs ($dependabot_prs): These are usually safe to merge after testing"
  echo "   - Run: ./check-pr.sh <pr-number> for each dependabot PR"
fi

if [ $codex_prs -gt 0 ]; then
  echo "🔍 Codex PRs ($codex_prs): Review these carefully for code quality"
  echo "   - Check for proper testing and documentation"
  echo "   - Verify changes align with project goals"
fi

if [ $draft_prs -gt 0 ]; then
  echo "📝 Draft PRs ($draft_prs): These are work in progress"
  echo "   - Wait for author to mark as ready for review"
fi

echo ""
echo "🚀 Next Actions:"
echo "==============="
echo "1. Run: ./check-pr.sh <pr-number> to test individual PRs"
echo "2. Run: ./prepare-pr.sh main to test current branch"
echo "3. Use GitHub Actions workflow to automate testing"
echo "4. Review and merge ready PRs"
