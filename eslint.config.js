// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', '.kilo/*'],
  },
  {
    files: ['scripts/**/*.js', 'plugins/**/*.js', 'jest.setup.js', 'metro.config.js', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: { __dirname: 'readonly', require: 'readonly', process: 'readonly', jest: 'readonly' },
    },
  },
]);
