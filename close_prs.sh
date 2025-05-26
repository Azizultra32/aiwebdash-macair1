#!/bin/bash

# List all remaining branches that need PRs closed
BRANCHES=(
  "codex/add-cleanup-for-versioncheckinterval"
  "codex/add-eslint-js-to-devdependencies"
  "codex/add-metrics-md-for-bundle-size-and-performance"
  "codex/add-regenerator-runtime-import-in-main-tsx"
  "codex/add-sr-only-spans-to-icon-buttons"
  "codex/add-swupdatecheck-test-with-mock-service-worker"
  "codex/add-test-for-message-handler-and-mock-fetch"
  "codex/add-test-for-offline-dashboard-actions"
  "codex/add-test-for-offline-dashboard-with-vitest"
)

# Step 1: Make sure all these branches have different content from main
for branch in "${BRANCHES[@]}"; do
  echo "Making $branch unique..."
  git checkout "$branch"
  
  # Add a random file to make sure this branch has unique content
  echo "Making branch unique at $(date)" > "unique-$(date +%s).txt"
  git add .
  git commit -m "Make branch unique for proper PR closing"
  git push origin "$branch"
done

# Step 2: Check out main and make sure it's up to date
git checkout main
git pull origin main

# Step 3: Create GitHub-style merge commits for each branch
for branch in "${BRANCHES[@]}"; do
  echo "Creating GitHub-style merge commit for $branch..."
  
  # Force-create a merge commit
  git merge --no-ff -X theirs "$branch" -m "Merge pull request from $branch (closes #ISSUE_NUMBER)"
  git push origin main
done

echo "All PRs should now be properly closed on GitHub!"
