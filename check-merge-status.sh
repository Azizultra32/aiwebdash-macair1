#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Checking PR Merge Status"
echo "=========================="
echo "Generated: $(date)"
echo ""

# Function to check if PR is merged
check_pr_status() {
    local pr_number=$1
    local pr_title="$2"
    
    echo -n "PR #$pr_number ($pr_title): "
    
    # Use GitHub CLI if available, otherwise use curl
    if command -v gh &> /dev/null; then
        status=$(gh pr view $pr_number --json state --jq '.state' 2>/dev/null || echo "UNKNOWN")
        case $status in
            "MERGED")
                echo "✅ MERGED"
                return 0
                ;;
            "OPEN")
                echo "⏳ OPEN (ready to merge)"
                return 1
                ;;
            "CLOSED")
                echo "❌ CLOSED"
                return 1
                ;;
            *)
                echo "❓ UNKNOWN"
                return 1
                ;;
        esac
    else
        echo "❓ UNKNOWN (install gh CLI for status checking)"
        return 1
    fi
}

echo "📊 Ready PRs Status:"
echo "==================="

# Fetch open PR numbers and titles dynamically using gh if available,
# otherwise fall back to the GitHub API. The output format is
# "<number>\t<title>" per line.
if command -v gh &> /dev/null; then
    ready_pr_list=$(gh pr list --state open --json number,title -q '.[] | [.number, .title] | @tsv')
else
    echo "⚠️  gh CLI not found, falling back to GitHub API" >&2
    ready_pr_list=$(curl -s "https://api.github.com/repos/Azizultra32/aiwebdash-macair1/pulls?state=open" \
        | jq -r '.[] | "\(.number)\t\(.title)"')
fi

if [ -z "$ready_pr_list" ]; then
    echo "No open PRs found." >&2
    exit 0
fi

ready_prs=0
pending_prs=()
total_ready=$(echo "$ready_pr_list" | grep -c '^')

while IFS=$'\t' read -r pr_number pr_title; do
    if check_pr_status "$pr_number" "$pr_title"; then
        ((ready_prs++))
    else
        pending_prs+=("$pr_number")
    fi
done <<< "$ready_pr_list"

echo ""
echo "📈 Progress: $ready_prs/$total_ready PRs merged"

if [ $ready_prs -eq $total_ready ]; then
    echo "🎉 All ready PRs have been merged!"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Create TypeScript strict mode PR"
    echo "2. Create code cleanup PR"
    echo "3. Address remaining problematic PRs"
elif [ $ready_prs -gt 0 ]; then
    echo "⚡ Partial progress made!"
    echo ""
    echo "🔄 Continue with remaining PRs:"
    for pr in "${pending_prs[@]}"; do
        echo "- PR #$pr: https://github.com/Azizultra32/aiwebdash-macair1/pull/$pr"
    done
else
    echo "⏳ No PRs merged yet"
    echo ""
    echo "🚀 Start here:"
    for pr in "${pending_prs[@]}"; do
        echo "- PR #$pr: https://github.com/Azizultra32/aiwebdash-macair1/pull/$pr"
    done
fi

echo ""
echo "📋 Improvement PRs to Create:"
echo "============================"
echo "1. TypeScript Strict Mode: https://github.com/Azizultra32/aiwebdash-macair1/pull/new/improve/typescript-strict-mode"
echo "2. Code Cleanup: https://github.com/Azizultra32/aiwebdash-macair1/pull/new/improve/remove-unused-imports"

echo ""
echo "🛠️ Tools Available:"
echo "=================="
echo "- ./analyze-prs.sh - Analyze all PRs"
echo "- ./check-pr.sh <number> - Test individual PR"
echo "- ./check-merge-status.sh - Check merge progress (this script)"
