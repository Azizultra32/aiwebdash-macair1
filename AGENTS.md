# AGENTS.md

## PR Workflow
- Run `npm run prepare-pr [target-branch]` before opening a pull request.
- The script fetches from `origin`, rebases your branch, and runs the preflight, lint, and test steps.
- Ensure `node_modules/` exists by running `bash .codex/setup.sh` if necessary.

## Maintainer Workflow
- Review open pull requests using GitHub's PR page or the `gh` CLI (`gh pr status`, `gh pr checkout <PR#>`).
- Check for merge conflicts by rebasing the contributor's branch onto `main` with `./prepare-pr.sh main`.
- Request contributors to rebase if conflicts exist.
- Close stale pull requests that have not been updated for a long time.
