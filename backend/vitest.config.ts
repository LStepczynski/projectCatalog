import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
