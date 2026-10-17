import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

export default defineConfig({
  pack: {
    entry: ['src/index.ts'],
    dts: true,
    format: ['esm', 'cjs'],
    sourcemap: true,
  },
  lint: {
    ignorePatterns: ['archive/**', 'docs/**', 'dist/**', 'coverage/**', 'tests/consumer/**'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ['archive/**', 'docs/**', 'dist/**', 'coverage/**'],
    singleQuote: true,
    semi: false,
    printWidth: 144,
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'node',
          include: ['tests/consumer/e2e.test.ts'],
          environment: 'node',
        },
      },
      ...(['chromium', 'firefox', 'webkit'] as const).map((browser) => ({
        extends: true as const,
        test: {
          name: browser,
          include: ['tests/consumer/e2e.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser }],
          },
        },
      })),
    ],
    coverage: {
      enabled: false,
      reporter: ['text', 'html'],
    },
  },
})
