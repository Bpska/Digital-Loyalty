import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    // Target modern browsers — smaller, faster output
    target: 'es2020',

    // Warn only when a single chunk exceeds 800KB
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // Let Vite/Rollup manage code splitting defaults
      },
    },

    // Enable minification (default esbuild — very fast)
    minify: 'esbuild',

    // Generate source maps only in development
    sourcemap: false,
  },
});
