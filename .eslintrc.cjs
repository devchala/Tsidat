module.exports = {
  root: true,
  env: { es2021: true, node: true },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['dist', 'build', 'node_modules', '.expo'],
  overrides: [
    {
      files: ['packages/web/**/*.{js,jsx}'],
      env: { browser: true },
      extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'prettier'],
      plugins: ['react', 'react-hooks'],
      settings: { react: { version: 'detect' } },
      rules: { 'react/react-in-jsx-scope': 'off' },
    },
    {
      files: ['packages/backend/**/*.js'],
      env: { node: true },
      rules: { 'no-console': 'off' },
    },
  ],
};
