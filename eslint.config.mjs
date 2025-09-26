import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    rules: {
      // 禁止 console.log，顯示為 error
      'no-console': 'error',

      // 未使用的變數顯示為 error
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // 禁止未使用的導入
      'no-unused-vars': 'off', // 關閉基本規則，使用 TypeScript 版本

      // React hooks 規則
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript 相關規則
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // 一般 JavaScript 規則 (只保留不會與 Prettier 衝突的)
      'no-var': 'error',
      'prefer-const': 'error',

      // Next.js 特定規則
      '@next/next/no-img-element': 'warn',
    },
  },
];

export default eslintConfig;
