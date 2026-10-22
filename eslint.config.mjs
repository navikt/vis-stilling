import { anbefalt as toiA11y } from '@navikt/toi-next-frontend/eslint';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';

// Minimalt oppsett: bare parseren som trengs for TSX og a11y-reglene fra toi-next-frontend.
export default defineConfig([
    globalIgnores(['.next/', 'node_modules/', 'public/', 'playwright-report/', 'test-results/']),
    {
        files: ['**/*.{js,mjs,ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        linterOptions: { reportUnusedDisableDirectives: 'off' },
    },
    toiA11y,
]);
