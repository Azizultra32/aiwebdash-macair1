# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Development Setup

1. After cloning the repository, run the setup script once to install the Node.js dependencies:

   ```bash
   ./setup.sh
   ```
2. Codex executes `.codex/setup.sh` during environment initialization to install dependencies. If `node_modules/` is missing, run:

   ```bash
   bash .codex/setup.sh
   ```

   Verify that dependencies are present by running the preflight script:

   ```bash
   npm run preflight
   ```

3. Create a `.env` file by copying `.env.example` and updating the values for your environment.

4. Run the development server:

   ```bash
   npm run dev
   ```

## Environment variables

The application relies on several environment variables for Supabase and Stripe integration. Copy `.env.example` to `.env` and fill in the values.

- `VITE_APP_SUPABASE_URL` - URL of your Supabase project.
- `VITE_APP_SUPABASE_ANON_KEY` - Supabase anon (public) API key.
- `VITE_SUPABASE_URL` - same as `VITE_APP_SUPABASE_URL` for build-time use.
- `VITE_SUPABASE_ANON_KEY` - same as `VITE_APP_SUPABASE_ANON_KEY` for build-time use.
- `VITE_STRIPE_PUBLISHABLE_KEY` - public Stripe API key used by the client.
- `VITE_STRIPE_CHECKOUT_URL` - URL of the Stripe checkout serverless function.
- `STRIPE_SECRET_KEY` - secret Stripe key required by the serverless function.
- `VITE_PROMPT_MANAGER_IDS` - comma-separated list of user IDs allowed to manage prompts.
- `VITE_V0_API_URL` - base URL for the v0 UI generation API.
- `VITE_V0_API_KEY` - authentication token for the v0 API.

### Running ESLint

Before running the linter, ensure development dependencies are installed. Run
the preflight check to verify:

```bash
npm run preflight
```

If the script reports that `node_modules` is missing, install dependencies with:

```bash
bash .codex/setup.sh
```

Then check the codebase with ESLint:

```bash
npm run lint
```

### Running tests

Before running tests, verify dependencies with the preflight script and install
them if necessary:

```bash
npm run preflight
```

If `node_modules` is missing, run `bash .codex/setup.sh` before executing the test suite:

```bash
npm run test
```

To ensure code quality before committing or submitting pull requests, run the
linter and tests together:

```bash
npm run lint && npm run test
```

Before opening a pull request, rebase your branch and verify the project passes
all checks by running:

```bash
npm run prepare-pr [target-branch]
```

The script fetches from `origin`, rebases your branch onto the given target
branch, and runs the preflight, lint, and test steps.

### Testing notes

Service worker tests import `public/sw.js` directly. Workbox's precache
controller expects `self.__WB_MANIFEST` to contain a manifest array when the
script is executed. The build process normally injects this variable, so the
tests manually define `self.__WB_MANIFEST` with a dummy entry to prevent import
errors.

### Storybook

To develop components in isolation, run Storybook:

```bash
npm run storybook
```

The Storybook UI will be available at `http://localhost:6006`.

### Running Supabase locally

1. Install the Supabase CLI.
2. From the `supabase` directory start the stack:
```bash
supabase start
```
3. Point `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your environment to the local instance.
4. Stop the services with:
```bash
supabase stop
```

### Codex environment setup

Codex disables network access after the setup phase. The `.codex/setup.sh` script installs dependencies and fetches open pull requests while the network is still available. It first checks for an `origin` remote and falls back to the `REPO_URL` environment variable if one isn't configured.

```bash
#!/usr/bin/env bash
set -euo pipefail

# Install Node.js dependencies
if command -v npm >/dev/null 2>&1; then
  npm install --legacy-peer-deps
  npm run lint || echo "Linting failed during setup"
  npm run test || echo "Tests failed during setup"

  # Fetch open pull requests
  if git remote get-url origin >/dev/null 2>&1; then
    git fetch origin 'refs/pull/*/head:refs/pull/*' || true
  elif [ -n "${REPO_URL:-}" ]; then
    git remote add origin "$REPO_URL"
    git fetch origin 'refs/pull/*/head:refs/pull/*' || true
  else
    echo "Warning: no 'origin' remote found and REPO_URL is unset; skipping fetch"
  fi
  if command -v gh >/dev/null 2>&1; then
    gh pr list --state open --json number,title,headRefName > pr_list.json
  fi
else
  echo "Error: npm not found." >&2
  exit 1
fi
```

Codex will execute this script automatically during environment initialization.

### Working with PR branches

After running the setup script, you can use the included PR dashboard script to view and manage pull request branches:

```bash
./pr-dashboard.sh
```

The dashboard shows a list of all open PRs with:
- PR number and title (when using GitHub CLI)
- Commands to check out each PR branch
- Instructions for rebasing and merging

To work with a specific PR:

1. Check out the PR branch using the command from the dashboard
2. Rebase it on the latest main branch using `./prepare-pr.sh main`
3. Review the changes and run tests if needed
4. Merge to main with a descriptive commit message

This workflow allows for efficient PR management even when working offline.

## Service Worker Version Checks

When the service worker activates it broadcasts `GET_CURRENT_VERSION` to every connected client. Each client replies with its current version so the worker can compare it to the latest value from `version.json`.

After activation the worker repeats this broadcast every five minutes to detect updates without requiring a page reload. The interval ID is stored internally and cleared on `controllerchange` or `statechange` events when the worker is replaced, preventing orphaned timers.

## Prompt Playground

The dashboard includes a route at `/prompt-playground` for experimenting with prompt flows. Use it to test and refine prompts before integrating them into other workflows.

Open the settings dropdown in the top navigation bar and select **Prompt Playground** to access the page.

Only users listed in `VITE_PROMPT_MANAGER_IDS` can edit prompt components.

## License

This project is licensed under the [MIT License](LICENSE).
