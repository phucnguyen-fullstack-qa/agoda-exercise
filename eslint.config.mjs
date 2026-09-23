// @ts-check
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import playwright from 'eslint-plugin-playwright';

export default [
    js.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                sourceType: 'module',
            },
            globals: {
                Buffer: 'readonly',
                console: 'readonly',
                process: 'readonly',
                setTimeout: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': 'warn',
            'no-unused-vars': 'off',
            'max-len': [
                'error',
                {
                    code: 200,
                    tabWidth: 2,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                },
            ],
        },
    },
    {
        // Playwright test specs: enforce assertions, ban raw waits, and force
        // interactions to go through Page Objects instead of `page.locator()`.
        files: ['**/*.spec.ts'],
        plugins: {
            playwright,
        },
        rules: {
            ...playwright.configs['flat/recommended'].rules,
            'playwright/valid-title': 'off',
            'playwright/no-wait-for-timeout': 'error',
            'playwright/expect-expect': 'error',
            'no-restricted-syntax': [
                'error',
                {
                    selector: "CallExpression[callee.property.name='locator']",
                    message: 'Do not call page.locator() directly in spec files. Use the `ui` fixture / Page Objects instead.',
                },
            ],
        },
    },
    {
        ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', '**/*.js'],
    },
];
