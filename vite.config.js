// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        moon: resolve(__dirname, 'lab/moon/index.html'),
        f1: resolve(__dirname, 'lab/f1/index.html'),
        model: resolve(__dirname, 'lab/model/index.html'),
        model2: resolve(__dirname, 'lab/model2/index.html'),
      },
    },
  },
})
