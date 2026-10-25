import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api to FastAPI in dev so there are no CORS issues.
    proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } },
  },
})
