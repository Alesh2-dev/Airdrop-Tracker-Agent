import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: ' https://shrank-patrol-veteran.ngrok-free.dev -> http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
// http://localhost:3001
