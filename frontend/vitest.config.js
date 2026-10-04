import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.js'
      ]
    },
    // Don't hoist mocks to avoid issues with ES modules
    isolate: false,
    // Ensure React is available globally
    environmentMatchGlobs: [
      ['**/*.test.jsx', 'jsdom'],
      ['**/*.test.js', 'jsdom']
    ]
  }
});
