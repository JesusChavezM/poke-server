module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  env: { node: true, es2021: true },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // asegura que eslint y prettier no choquen
    'prettier'
  ],
  rules: {
    // tus reglas custom (ejemplo)
    'no-console': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
};