module.exports = {
  extends: ['next/core-web-vitals', '@multienlace/config/eslint-preset'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
