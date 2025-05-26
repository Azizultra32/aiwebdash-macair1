# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

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
- `STRIPE_SECRET_KEY` - secret Stripe key required by the serverless function.

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
