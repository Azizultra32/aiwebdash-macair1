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

### Preparing a Pull Request

Before opening a pull request, run the `prepare-pr.sh` script to rebase your
branch on the latest `main` branch and execute lint and test checks. This helps
resolve conflicts early and ensures code quality:

```bash
./prepare-pr.sh
```

If your main branch is named differently, pass it as the first argument:

```bash
./prepare-pr.sh production
```

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

Codex disables network access after the setup phase. Create a `.codex/setup.sh` script so dependencies are installed while the network is still available:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Install Node.js dependencies
if command -v npm >/dev/null 2>&1; then
  npm ci --include=dev
else
  echo "Error: npm not found." >&2
  exit 1
fi
```

Codex will execute this script automatically during environment initialization.

