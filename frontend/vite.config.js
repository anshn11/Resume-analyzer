import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /auth/* requests to the Express + Passport server
      '/auth': {
        target:       'http://localhost:3001',
        changeOrigin: true,
        secure:       false,
        configure: (proxy) => {
          // On every request: set origin so CORS/session trust it
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('origin', 'http://localhost:5173');
          });
          // On every response: rewrite Set-Cookie so the browser stores
          // the session cookie against the FRONTEND origin (port 5173),
          // not the raw backend port (3001).
          proxy.on('proxyRes', (proxyRes) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              proxyRes.headers['set-cookie'] = cookies.map((c) =>
                c
                  .replace(/;\s*Domain=[^;]*/gi, '')   // remove domain attribute
                  .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')  // downgrade for HTTP
              );
            }
          });
        },
      },
      '/api': {
        target:       'http://localhost:3001',
        changeOrigin: true,
        secure:       false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('origin', 'http://localhost:5173');
          });
        },
      },
    },
  },
})

