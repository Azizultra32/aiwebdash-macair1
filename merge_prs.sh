#!/bin/bash
set -e

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

for branch in "${BRANCHES[@]}"; do
  echo "Processing $branch"
  git checkout "$branch"
  
  # Create a unique metadata file for this branch to force a content difference
  TIMESTAMP=$(date +%s)
  SAFE_BRANCH=$(echo "$branch" | tr '/' '-')
  echo "Merged at: $TIMESTAMP" > ".merge-metadata-$SAFE_BRANCH.txt"
  git add ".merge-metadata-$SAFE_BRANCH.txt"
  git commit -m "Add merge metadata for $branch"
  git push origin "$branch"
  
  # Switch to main and merge the branch with a proper merge commit
  git checkout main
  git merge --no-ff "$branch" -m "Merge pull request from $branch"
  git push origin main
done

git checkout main
echo "All branches have been merged!"
