const { FlatCompat } = require('@eslint/eslintrc');

// Provide the recommended configuration explicitly to avoid a
// "missing recommendedConfig" constructor error when using FlatCompat.
const compat = new FlatCompat({ recommendedConfig: require('@eslint/js').configs.recommended });

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'env.d.ts', 'eslint.config.cjs', '.storybook/**', '**/*.stories.tsx'],
  },
  ...compat.config({
    env: { browser: true, es2020: true },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:import/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:@typescript-eslint/recommended-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',
      'eslint-config-prettier',
    ],
    settings: {
      react: {
        // Tells eslint-plugin-react to automatically detect the version of React to use.
        version: 'detect',
      },
      // Tells eslint how to resolve imports
      'import/resolver': {
        node: {
          paths: ['src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {},
      },
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./tsconfig.json', './tsconfig.node.json'],
    },
    plugins: ['react-refresh', 'import'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'import/named': 'off',
    },
  }),
];
