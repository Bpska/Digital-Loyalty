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
        // Split vendor libraries into separate cached chunks
        manualChunks(id) {
          // React core — tiny, always loaded
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // Routing
          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
            return 'react-router';
          }
          // Data fetching
          if (id.includes('node_modules/@tanstack/')) {
            return 'tanstack';
          }
          // Radix UI component library
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix-ui';
          }
          // Recharts (heavy charting lib — admin only)
          if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-') || id.includes('node_modules/d3/')) {
            return 'recharts';
          }
          // Leaflet maps (heavy — customer/map features)
          if (id.includes('node_modules/leaflet/') || id.includes('node_modules/react-leaflet/')) {
            return 'leaflet';
          }
          // QR scanner (heavy — checkin page only)
          if (id.includes('node_modules/html5-qrcode/')) {
            return 'qrcode';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'lucide';
          }
          // All other node_modules go into a general vendor chunk
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
      },
    },

    // Enable minification (default esbuild — very fast)
    minify: 'esbuild',

    // Generate source maps only in development
    sourcemap: false,
  },
});
