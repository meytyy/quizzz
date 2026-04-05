import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // Разрешить доступ по сети
    port: 5173,
    strictPort: false,
    allowedHosts: ['.trycloudflare.com'], // Если порт занят, попробует следующий
  },
  preview: {
    host: true, // Разрешить доступ по сети для preview
    port: 4173,
    strictPort: false,
  },
})

