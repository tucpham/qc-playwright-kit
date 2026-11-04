// Lint rules = automated part of the test review checklist (docs/04-review-checklist.md).
// Errors block merge. Do not disable rules inline without a comment explaining why.
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results', '.auth', 'demo-app', 'scripts'] },
  ...tseslint.configs.recommended,
  {
    files: ['kit/**/*.ts', 'project/**/*.ts', 'tests/**/*.ts'],
    rules: {
      'no-empty-pattern': 'off', // Playwright fixtures use `async ({}, use)`
    },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,

      // Stability
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-wait-for-selector': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-force-option': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/no-useless-not': 'error',

      // Every test must check something. Helpers named expect* count as assertions.
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect'] }],

      // Only the standard tags (kit/tags.ts). Typos like @smok fail lint.
      'playwright/valid-test-tags': ['error', { allowedTags: ['@smoke', '@regression', '@critical', '@slow'] }],

      // Readability / review
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-conditional-expect': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
      'playwright/no-raw-locators': ['warn', { allowed: [] }],
      'playwright/no-nested-step': 'error',

      // Locator quality: no XPath / long CSS chains in tests
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='locator'] > Literal[value=/^(\\/\\/|xpath=)/]",
          message: 'XPath locators are not allowed. Use getByRole / getByLabel / getByTestId.',
        },
        {
          selector: "CallExpression[callee.property.name='locator'] > Literal[value=/(>.*){2,}|:nth-child/]",
          message: 'Long CSS chains break easily. Use user-facing locators or ask dev for data-testid.',
        },
      ],
    },
  },
);
