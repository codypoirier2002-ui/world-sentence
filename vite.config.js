import { defineConfig } from 'vite';

// Relative base so the build works on GitHub Pages under /<repo>/ and anywhere else.
export default defineConfig({
  base: './',
  server: {
    host: true,
    proxy: {
      // the AI server (npm run server) listens on 8787 by default
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
});
