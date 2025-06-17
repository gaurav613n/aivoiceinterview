import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add proper module aliasing
      'regenerator-runtime': path.resolve(__dirname, 'node_modules/regenerator-runtime'),
    }
  },
  optimizeDeps: {
    include: ['regenerator-runtime'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})