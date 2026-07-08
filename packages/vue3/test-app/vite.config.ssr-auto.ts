import luna from '@lunajs/vite'
import vue from '@vitejs/plugin-vue'
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
        port: 13718,
      },
    }),
    vue({
      features: { prodDevtools: true },
    }),
  ],
})
