import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts', 'lang/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**', 'out/**']
  }
})
