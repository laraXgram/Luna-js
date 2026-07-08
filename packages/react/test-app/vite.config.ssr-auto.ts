import luna from '@lunajs/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': __dirname,
    },
  },
  plugins: [
    luna({
      ssr: {
        port: 13719,
      },
    }),
    react(),
  ],
})
