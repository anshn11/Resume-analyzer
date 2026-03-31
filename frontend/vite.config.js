import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /auth/* requests to the Express + Passport server
      '/auth': {
        target:      'http://localhost:3001',
        changeOrigin: true,
        secure:       false,
        // Forward cookies so passport sessions work across the proxy
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('origin', 'http://localhost:5173');
          });
        },
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
