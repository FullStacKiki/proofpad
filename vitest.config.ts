import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Kept separate from vite.config.ts so the Tauri build config stays untouched.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
      exclude: ['**/node_modules/**', 'src-tauri/**'],
      environment: 'node',
    },
  }),
);
