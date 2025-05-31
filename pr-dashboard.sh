#!/usr/bin/env bash
set -euo pipefail

# Styling constants
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BOLD}Pull Request Dashboard${NC}\n"

# Check if pr_list.json exists (created by GitHub CLI)
if [ -f "pr_list.json" ]; then
  echo "Using PR metadata from GitHub CLI..."
  
  # Check if jq is available for better formatting
  if command -v jq &>/dev/null; then
    # Pretty print the PR information with jq
    echo -e "${BOLD}Open PRs:${NC}"
    jq -r '.[] | "\(.number) | \(.title) | \(.headRefName) | git checkout -b pr-\(.number)-merge refs/pull/\(.number)"' pr_list.json | 
      awk -F' \\| ' '{printf "'"${GREEN}"'#%-4s'"${NC}"' '"${BOLD}"'%s'"${NC}"'\n    Branch: '"${BLUE}"'%s'"${NC}"'\n    '"${YELLOW}"'%s'"${NC}"'\n\n", $1, $2, $3, $4}'
  else
    # Basic formatting without jq
    echo -e "${BOLD}Open PRs:${NC} (install jq for better formatting)"
    cat pr_list.json | grep -o '"number":[^,]*' | cut -d':' -f2 | 
    while read -r PR_NUM; do
      PR_TITLE=$(grep -A1 "\"number\":$PR_NUM" pr_list.json | grep "title" | cut -d'"' -f4)
      PR_BRANCH=$(grep -A2 "\"number\":$PR_NUM" pr_list.json | grep "headRefName" | cut -d'"' -f4)
      echo -e "${GREEN}#$PR_NUM${NC} ${BOLD}$PR_TITLE${NC}"
      echo -e "    Branch: ${BLUE}$PR_BRANCH${NC}"
      echo -e "    ${YELLOW}git checkout -b pr-$PR_NUM-merge refs/pull/$PR_NUM${NC}"
      echo ""
    done
  fi
else
  # Fallback to git refs if pr_list.json doesn't exist
  echo "Using git refs (run .codex/setup.sh with GitHub CLI for more details)..."
  
  # List all PR refs and extract the PR numbers
  git for-each-ref --format="%(refname:short)" refs/pull/*/head | 
  while read -r REF; do
    PR_NUM=$(echo "$REF" | sed 's|refs/pull/\([0-9]*\)/head|\1|')
    echo -e "${GREEN}#$PR_NUM${NC}"
    echo -e "    ${YELLOW}git checkout -b pr-$PR_NUM-merge $REF${NC}"
    echo ""
  done
fi

echo -e "${BOLD}To prepare a PR for merging:${NC}"
echo -e "1. Check out the PR branch: ${YELLOW}git checkout -b pr-XXX-merge refs/pull/XXX${NC}"
echo -e "2. Rebase on main: ${YELLOW}./prepare-pr.sh main${NC}"
echo -e "3. Review changes: ${YELLOW}git diff main..HEAD${NC}"
echo -e "4. Merge to main: ${YELLOW}git checkout main && git merge --no-ff pr-XXX-merge -m \"Merge PR #XXX: Title\"${NC}"
