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

ready_prs=0
total_ready=3

if check_pr_status 243 "react-speech-recognition"; then
    ((ready_prs++))
fi

if check_pr_status 244 "zod"; then
    ((ready_prs++))
fi

if check_pr_status 245 "@testing-library/react"; then
    ((ready_prs++))
fi

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
    [ $ready_prs -lt 1 ] && echo "- PR #243: https://github.com/Azizultra32/aiwebdash-macair1/pull/243"
    [ $ready_prs -lt 2 ] && echo "- PR #244: https://github.com/Azizultra32/aiwebdash-macair1/pull/244"
    [ $ready_prs -lt 3 ] && echo "- PR #245: https://github.com/Azizultra32/aiwebdash-macair1/pull/245"
else
    echo "⏳ No PRs merged yet"
    echo ""
    echo "🚀 Start here:"
    echo "1. PR #243: https://github.com/Azizultra32/aiwebdash-macair1/pull/243"
    echo "2. PR #244: https://github.com/Azizultra32/aiwebdash-macair1/pull/244"
    echo "3. PR #245: https://github.com/Azizultra32/aiwebdash-macair1/pull/245"
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
