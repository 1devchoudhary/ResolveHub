import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules', 'coverage'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      // Unused args are fine when prefixed with "_" (e.g. Express signatures)
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      // Use the pino logger; console output is unstructured and unredacted
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Scripts are CLI tools and print to the terminal on purpose
    files: ['scripts/**/*.js'],
    rules: { 'no-console': 'off' },
  },
];
