import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
      exclude: [
        'src/lib/types/**',
        'src/lib/**/*.d.ts',
        'src/lib/**/index.ts',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
        'src/components/ui/**', // Shadcn UI components (no need to test)
        'src/components/import-ai-recommendations-example.tsx', // Parse error in coverage
      ],
      thresholds: {
        statements: 40,
        branches: 40,
        functions: 40,
        lines: 40,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
