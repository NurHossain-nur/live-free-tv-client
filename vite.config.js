import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // 1. Import the new v4 plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Add it to the plugins array
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
      // forward it to the real domain without triggering CORS.
      '/api-football': {
        target: 'https://m.allfootballapp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-football/, '')
      }
    },
  },
});