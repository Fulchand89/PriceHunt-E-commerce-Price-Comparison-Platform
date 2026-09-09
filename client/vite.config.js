import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Forward all /api requests to the Express server
      '/api': {
        target:       'http://localhost:5000',
        changeOrigin: true,
        secure:       false,
        rewrite:      (path) => path,  // keep /api prefix — server mounts at /api
      },
      // Also forward health check
      '/health': {
        target:       'http://localhost:5000',
        changeOrigin: true,
        secure:       false,
      },
    },
  },
});
