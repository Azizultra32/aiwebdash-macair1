#!/usr/bin/env bash
set -euo pipefail

echo "🚀 QUICK ACTIONS MENU"
echo "===================="
echo ""

show_menu() {
    echo "Choose your next action:"
    echo ""
    echo "1. 🌐 Open ready PRs for manual merge"
    echo "2. 🤖 Create auto-merge workflow PR"
    echo "3. 🔧 Create improvement PRs"
    echo "4. 📊 Check current status"
    echo "5. 🧪 Test a specific PR"
    echo "6. 📋 Show merge guide"
    echo "7. ❌ Exit"
    echo ""
}

open_ready_prs() {
    echo "🌐 Opening ready PRs in browser..."

    local pr_urls=()
    if command -v gh &> /dev/null; then
        mapfile -t pr_urls < <(gh pr list --state open --json url --jq '.[].url')
    elif [ -f "pr_list.json" ]; then
        mapfile -t pr_urls < <(
            jq -r '.[].number' pr_list.json \
            | sed 's|^|https://github.com/Azizultra32/aiwebdash-macair1/pull/|'
        )
    else
        echo "❌ pr_list.json not found and gh CLI missing"
        return 1
    fi

    if [ ${#pr_urls[@]} -eq 0 ]; then
        echo "No open PRs found"
        return 0
    fi

    local open_cmd=""
    if command -v open &> /dev/null; then
        open_cmd="open"
    elif command -v xdg-open &> /dev/null; then
        open_cmd="xdg-open"
    fi

    for url in "${pr_urls[@]}"; do
        if [ -n "$open_cmd" ]; then
            "$open_cmd" "$url"
        else
            echo "Manual URL: $url"
        fi
    done
}

create_workflow_pr() {
    echo "🤖 Opening auto-merge workflow PR creation..."
    if command -v open &> /dev/null; then
        open "https://github.com/Azizultra32/aiwebdash-macair1/pull/new/feature/auto-merge-workflow"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://github.com/Azizultra32/aiwebdash-macair1/pull/new/feature/auto-merge-workflow"
    else
        echo "Manual URL:"
        echo "https://github.com/Azizultra32/aiwebdash-macair1/pull/new/feature/auto-merge-workflow"
    fi
}

create_improvement_prs() {
    echo "🔧 Opening improvement PR creation pages..."
    if command -v open &> /dev/null; then
        open "https://github.com/Azizultra32/aiwebdash-macair1/pull/new/improve/typescript-strict-mode"
        open "https://github.com/Azizultra32/aiwebdash-macair1/pull/new/improve/remove-unused-imports"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://github.com/Azizultra32/aiwebdash-macair1/pull/new/improve/typescript-strict-mode"
        xdg-open "https://github.com/Azizultra32/aiwebdash-macair1/pull/new/improve/remove-unused-imports"
    else
        echo "Manual URLs:"
        echo "TypeScript Strict: https://github.com/Azizultra32/aiwebdash-macair1/pull/new/improve/typescript-strict-mode"
        echo "Code Cleanup: https://github.com/Azizultra32/aiwebdash-macair1/pull/new/improve/remove-unused-imports"
    fi
}

test_specific_pr() {
    echo "🧪 Enter PR number to test:"
    read -r pr_number
    if [[ "$pr_number" =~ ^[0-9]+$ ]]; then
        ./check-pr.sh "$pr_number"
    else
        echo "❌ Invalid PR number"
    fi
}

show_merge_guide() {
    if [ -f "MERGE_GUIDE.md" ]; then
        cat MERGE_GUIDE.md
    else
        echo "❌ MERGE_GUIDE.md not found"
    fi
}

# Main menu loop
while true; do
    show_menu
    read -r choice
    
    case $choice in
        1)
            open_ready_prs
            ;;
        2)
            create_workflow_pr
            ;;
        3)
            create_improvement_prs
            ;;
        4)
            ./check-merge-status.sh
            ;;
        5)
            test_specific_pr
            ;;
        6)
            show_merge_guide
            ;;
        7)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    echo "Press Enter to continue..."
    read -r
    clear
done
