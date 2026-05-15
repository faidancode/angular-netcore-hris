import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolve(rootDir, 'src/app/core'),
      '@shared': resolve(rootDir, 'src/app/shared'),
      '@pages': resolve(rootDir, 'src/app/pages'),
      '@env': resolve(rootDir, 'src/environments'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['e2e/**'],
  },
});
